const loadDevices=async()=>await fetch("/json").then(e=>e.json()).then(e=>e.Sensors),getConfigNodes=async()=>{return(await loadDevices()).map(e=>{const t=[{group:"TRIGGERS",type:e.TaskName,inputs:[],outputs:[1],config:[{name:"variable",type:"select",values:e.TaskValues.map(e=>e.Name)},{name:"value",type:"number"}],indent:!0,toString:function(){return`${this.type}.${this.config[0].value} == ${this.config[1].value}`},toDsl:function(){return[`on ${this.type}#${this.config[0].value}=${this.config[1].value} do\n%%output%%\nEndon\n`]}}];let n,a;switch(e.Type){case"Regulator - Level Control":t.push({group:"ACTIONS",type:`${e.TaskName} - setlevel`,inputs:[1],outputs:[1],config:[{name:"value",type:"number"}],toString:function(){return`${e.TaskName}.level = ${this.config[0].value}`},toDsl:function(){return[`config,task,${e.TaskName},setlevel,${this.config[0].value}`]}});break;case"PCA9685":case"PCF8574":case"MCP23017":a=(n={PCA9685:"PCF",PCF8574:"PCF",MCP23017:"MCP"})[e.Type],t.push({group:"ACTIONS",type:`${e.TaskName} - GPIO`,inputs:[1],outputs:[1],config:[{name:"pin",type:"select",values:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},{name:"value",type:"select",values:[0,1]}],toString:function(){return`${e.TaskName}.pin${this.config[0].value} = ${this.config[1].value}`},toDsl:function(){return[`${a}GPIO,${this.config[0].value},${this.config[1].value}`]}}),t.push({group:"ACTIONS",type:`${e.TaskName} - Pulse`,inputs:[1],outputs:[1],config:[{name:"pin",type:"select",values:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},{name:"value",type:"select",values:[0,1]},{name:"unit",type:"select",values:["ms","s"]},{name:"duration",type:"number"}],toString:function(){return`${e.TaskName}.pin${this.config[0].value} = ${this.config[1].value} for ${this.config[3].value}${this.config[2].value}`},toDsl:function(){return"s"===this.config[2].value?[`${a}LongPulse,${this.config[0].value},${this.config[1].value},${this.config[2].value}`]:[`${a}Pulse,${this.config[0].value},${this.config[1].value},${this.config[2].value}`]}});break;case"ProMiniExtender":t.push({group:"ACTIONS",type:`${e.TaskName} - GPIO`,inputs:[1],outputs:[1],config:[{name:"pin",type:"select",values:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},{name:"value",type:"select",values:[0,1]}],toString:function(){return`${e.TaskName}.pin${this.config[0].value} = ${this.config[1].value}`},toDsl:function(){return[`EXTGPIO,${this.config[0].value},${this.config[1].value}`]}});break;case"OLEDDisplay":case"LCDDisplay":a=(n={OLEDDisplay:"OLED",LCDDisplay:"LCD"})[e.Type],t.push({group:"ACTIONS",type:`${e.TaskName} - Write`,inputs:[1],outputs:[1],config:[{name:"row",type:"select",values:[1,2,3,4]},{name:"column",type:"select",values:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]},{name:"text",type:"text"}],toString:function(){return`${e.TaskName}.text = ${this.config[2].value}`},toDsl:function(){return[`${a},${this.config[0].value},${this.config[1].value},${this.config[2].value}`]}});break;case"Generic - Dummy Device":t.push({group:"ACTIONS",type:`${e.TaskName} - Write`,inputs:[1],outputs:[1],config:[{name:"variable",type:"select",values:e.TaskValues.map(e=>e.Name)},{name:"value",type:"text"}],toString:function(){return`${e.TaskName}.${this.config[0].value} = ${this.config[1].value}`},toDsl:function(){return[`TaskValueSet,${e.TaskNumber},${this.config[0].values.findIndex(this.config[0].value)},${this.config[1].value}`]}})}return t}).flat()},storeConfig=async e=>{const t=new FormData;return t.append("edit",1),t.append("file",new File([new Blob([e])],"r1.txt")),await fetch("/upload",{method:"post",body:t})},loadConfig=async()=>await fetch("/r1.txt"),storeRule=async e=>{const t=new FormData;return t.append("set",1),t.append("rules",e),await fetch("/rules",{method:"post",body:t})};