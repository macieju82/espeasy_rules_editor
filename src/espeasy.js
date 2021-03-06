const loadDevices = async () => {
    return await fetch('/json').then(response => response.json()).then(response => response.Sensors);
}

const getConfigNodes = async () => {
    const devices = await loadDevices();
    const vars = [];
    const nodes = devices.map(device => {

        device.TaskValues.forEach(value => vars.push(`${device.TaskName}#${value.Name}`));

        const result = [{
            group: 'TRIGGERS',
            type: device.TaskName,
            inputs: [],
            outputs: [1],
            config: [{
                name: 'variable',
                type: 'select',
                values: device.TaskValues.map(value => value.Name),
                value: device.TaskValues[0].Name,
            }, {
                name: 'euqality',
                type: 'select',
                values: ['', '=', '<', '>', '<=', '>=', '!='],
                value: '',
            }, {
                name: 'value',
                type: 'number',
            }],
            indent: true,
            toString: function () { 
                const comparison = this.config[1].value === '' ? 'changes' : `${this.config[1].value} ${this.config[2].value}`;
                return `when ${this.type}.${this.config[0].value} ${comparison}`; 
            },
            toDsl: function () { 
                const comparison = this.config[1].value === '' ? '' : `${this.config[1].value}${this.config[2].value}`;
                return [`on ${this.type}#${this.config[0].value}${comparison} do\n%%output%%\nEndon\n`]; 
            }
        }];

        let fnNames, fnName, name;
        switch (device.Type) {
            // todo: need access to GPIO number
            // case 'Switch input - Switch':
            //     result.push({
            //         group: 'ACTIONS',
            //         type: `${device.TaskName} - switch`,
            //         inputs: [1],
            //         outputs: [1],
            //         config: [{
            //             name: 'value',
            //             type: 'number',
            //         }],
            //         toString: function () { return `${device.TaskName}.level = ${this.config[0].value}`; },
            //         toDsl: function () { return [`config,task,${device.TaskName},setlevel,${this.config[0].value}`]; }
            //     });
            //     break;
            case 'Regulator - Level Control':
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - setlevel`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'value',
                        type: 'number',
                    }],
                    toString: function () { return `${device.TaskName}.level = ${this.config[0].value}`; },
                    toDsl: function () { return [`config,task,${device.TaskName},setlevel,${this.config[0].value}`]; }
                });
                break;
            case 'PCA9685':
            case 'PCF8574':
            case 'MCP23017':
                fnNames = {
                    'PCA9685': 'PCF',
                    'PCF8574': 'PCF',
                    'MCP23017': 'MCP',
                };
                fnName = fnNames[device.Type];
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - GPIO`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'pin',
                        type: 'select',
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                    }, {
                        name: 'value',
                        type: 'select',
                        values: [0, 1],
                    }],
                    toString: function () { return `${device.TaskName}.pin${this.config[0].value} = ${this.config[1].value}`; },
                    toDsl: function () { return [`${fnName}GPIO,${this.config[0].value},${this.config[1].value}`]; }
                });
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - Pulse`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'pin',
                        type: 'select',
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                    }, {
                        name: 'value',
                        type: 'select',
                        values: [0, 1],
                    },{
                        name: 'unit',
                        type: 'select',
                        values: ['ms', 's'],
                    },{
                        name: 'duration',
                        type: 'number',
                    }],
                    toString: function () { return `${device.TaskName}.pin${this.config[0].value} = ${this.config[1].value} for ${this.config[3].value}${this.config[2].value}`; },
                    toDsl: function () { 
                        if (this.config[2].value === 's') {
                            return [`${fnName}LongPulse,${this.config[0].value},${this.config[1].value},${this.config[2].value}`]; 
                        } else {
                            return [`${fnName}Pulse,${this.config[0].value},${this.config[1].value},${this.config[2].value}`]; 
                        }
                    }
                });
                break;
            case 'ProMiniExtender':
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - GPIO`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'pin',
                        type: 'select',
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                    }, {
                        name: 'value',
                        type: 'select',
                        values: [0, 1],
                    }],
                    toString: function () { return `${device.TaskName}.pin${this.config[0].value} = ${this.config[1].value}`; },
                    toDsl: function () { return [`EXTGPIO,${this.config[0].value},${this.config[1].value}`]; }
                });
                break;
            case 'OLEDDisplay':
            case 'LCDDisplay':
                fnNames = {
                    'OLEDDisplay': 'OLED',
                    'LCDDisplay': 'LCD',
                };
                fnName = fnNames[device.Type];
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - Write`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'row',
                        type: 'select',
                        values: [1, 2, 3, 4],
                    }, {
                        name: 'column',
                        type: 'select',
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                    }, {
                        name: 'text',
                        type: 'text',
                    }],
                    toString: function () { return `${device.TaskName}.text = ${this.config[2].value}`; },
                    toDsl: function () { return [`${fnName},${this.config[0].value},${this.config[1].value},${this.config[2].value}`]; }
                });
                break;
            case 'Generic - Dummy Device':
                result.push({
                    group: 'ACTIONS',
                    type: `${device.TaskName} - Write`,
                    inputs: [1],
                    outputs: [1],
                    config: [{
                        name: 'variable',
                        type: 'select',
                        values: device.TaskValues.map(value => value.Name),
                    }, {
                        name: 'value',
                        type: 'text',
                    }],
                    toString: function () { return `${device.TaskName}.${this.config[0].value} = ${this.config[1].value}`; },
                    toDsl: function () { return [`TaskValueSet,${device.TaskNumber},${this.config[0].values.findIndex(this.config[0].value)},${this.config[1].value}`]; }
                });
                break;
        }

        return result;
    }).flat();

    return { nodes, vars };
}

const storeConfig = async (config) => {
    const formData = new FormData();
    formData.append('edit', 1);
    formData.append('file', new File([new Blob([config])], "r1.txt"));
    
    return await fetch('/upload', {
        method: 'post',
        body: formData,
    });
}

const loadConfig = async () => {
    return await fetch('/r1.txt').then(response => response.json());
}

const storeRule = async (rule) => {
    const formData = new FormData();
    formData.append('set', 1);
    formData.append('rules', rule);
    
    return await fetch('/rules', {
        method: 'post',
        body: formData,
    });
}