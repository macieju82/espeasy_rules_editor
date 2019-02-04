const color="#000000",saveChart=e=>{return e.filter(e=>"TRIGGERS"===e.group).map(e=>{const t=e=>({t:e.type,v:e.config.map(e=>e.value),o:e.outputs.map(e=>e.lines.map(e=>t(e.input.nodeObject))),c:[e.position.x,e.position.y]});return t(e)})},loadChart=(e,t,n)=>{e.forEach(e=>{const s=t.nodes.find(t=>e.t==t.type);let o=new NodeUI(t.canvas,s,{x:e.c[0],y:e.c[1]});if(o.config.forEach((t,n)=>{t.value=e.v[n]}),o.render(),t.renderedNodes.push(o),n){const e=n.getBoundingClientRect(),s=o.inputs[0].getBoundingClientRect(),i=new svgArrow(document.body.clientWidth,document.body.clientHeight,"none",color);t.canvas.appendChild(i.element);const a=e.x+e.width,d=e.y+e.height/2,l=s.x,r=s.y+s.height/2;i.setPath(a,d,l,r);const c={output:n,input:o.inputs[0],svg:i,start:{x:a,y:d},end:{x:l,y:r}};o.inputs[0].lines.push(c),n.lines.push(c)}e.o.forEach((e,n)=>{loadChart(e,t,o.outputs[n])})})},exportChart=e=>{const t=e.filter(e=>"TRIGGERS"===e.group);let n="";return t.forEach(e=>{const t=(e,n)=>{const s=e.toDsl?e.toDsl():[];let o="",i=e.indent?"  ":"";return e.outputs.forEach((i,a)=>{let d=s[a]||e.type+"\n",l="";i.lines&&i.lines.forEach(s=>{l+=t(s.input.nodeObject,e.indent?n+1:n)}),d.includes("%%output%%")?d=d.replace("%%output%%",l):d+=l,o+=d}),o=o.split("\n").map(e=>i+e).join("\n")},s=t(e,0);n+=s+"\n\n"}),n},dNd={enableNativeDrag:(e,t)=>{e.draggable=!0,e.ondragstart=(e=>{Object.keys(t).forEach(n=>{e.dataTransfer.setData(n,t[n])})})},enableNativeDrop:(e,t)=>{e.ondragover=(e=>{e.preventDefault()}),e.ondrop=t}};class svgArrow{constructor(e,t,n,s){this.element=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.element.setAttribute("style","z-index: -1;position:absolute;top:0px;left:0px"),this.element.setAttribute("width",e),this.element.setAttribute("height",t),this.element.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),this.line=document.createElementNS("http://www.w3.org/2000/svg","path"),this.line.setAttributeNS(null,"fill",n),this.line.setAttributeNS(null,"stroke",s),this.element.appendChild(this.line)}setPath(e,t,n,s,o=.5){const i=(n-e)*o,a=`M ${e} ${t} C ${e+i} ${t} ${n-i} ${s} ${n} ${s}`;this.line.setAttributeNS(null,"d",a)}}class Node{constructor(e){this.type=e.type,this.group=e.group,this.config=e.config.map(e=>Object.assign({},e)),this.inputs=e.inputs.map(e=>{}),this.outputs=e.outputs.map(e=>{}),this.toDsl=e.toDsl,this.toString=e.toString,this.indent=e.indent}}class NodeUI extends Node{constructor(e,t,n){super(t),this.canvas=e,this.position=n,this.lines=[],this.linesEnd=[],this.toDsl=t.toDsl,this.toString=t.toString,this.indent=t.indent}handleMoveEvent(e){const t=event.clientX-this.element.getBoundingClientRect().left,n=event.clientY-this.element.getBoundingClientRect().top,s=event.clientX,o=event.clientY,i=e=>{this.element.style.top=`${e.y-n}px`,this.element.style.left=`${e.x-t}px`,this.inputs.forEach(t=>{t.lines.forEach(t=>{const n=t.end.x-(s-e.x),i=t.end.y-(o-e.y);t.svg.setPath(t.start.x,t.start.y,n,i)})}),this.outputs.forEach(t=>{t.lines.forEach(t=>{const n=t.start.x-(s-e.x),i=t.start.y-(o-e.y);t.svg.setPath(n,i,t.end.x,t.end.y)})})},a=e=>{this.inputs.forEach(t=>{t.lines.forEach(t=>{t.end.x-=s-e.x,t.end.y-=o-e.y})}),this.outputs.forEach(t=>{t.lines.forEach(t=>{t.start.x-=s-e.x,t.start.y-=o-e.y})}),document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a)};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)}handleDblClickEvent(e){this.config.length&&showConfigBox(this.type,this.config,()=>{this.text.textContent=this.toString()})}handleRightClickEvent(e){return this.inputs.forEach(e=>{e.lines.forEach(e=>{e.svg.element.parentNode.removeChild(e.svg.element)}),e.lines=[]}),this.outputs.forEach(e=>{e.lines.forEach(e=>{e.svg.element.parentNode.removeChild(e.svg.element)}),e.lines=[]}),this.element.parentNode.removeChild(this.element),this.destroy(),e.preventDefault(),e.stopPropagation(),!1}render(){this.element=document.createElement("div"),this.element.nodeObject=this,this.element.className=`node node-chart group-${this.group}`,this.text=document.createElement("span"),this.text.textContent=this.toString(),this.element.appendChild(this.text),this.element.style.top=`${this.position.y}px`,this.element.style.left=`${this.position.x}px`;const e=document.createElement("div");e.className="node-inputs",this.element.appendChild(e),this.inputs.forEach((t,n)=>{const s=this.inputs[n]=document.createElement("div");s.className="node-input",s.nodeObject=this,s.lines=[],s.onmousedown=(e=>{e.preventDefault(),e.stopPropagation()}),e.appendChild(s)});const t=document.createElement("div");t.className="node-outputs",this.element.appendChild(t),this.outputs.forEach((e,n)=>{const s=this.outputs[n]=document.createElement("div");s.className="node-output",s.nodeObject=this,s.lines=[],s.oncontextmenu=(e=>(s.lines.forEach(e=>{e.svg.element.parentNode.removeChild(e.svg.element)}),s.lines=[],e.stopPropagation(),e.preventDefault(),!1)),s.onmousedown=(e=>{if(e.stopPropagation(),s.lines.length)return;const t=e.pageX,n=e.pageY,o=new svgArrow(document.body.clientWidth,document.body.clientHeight,"none",color);this.canvas.appendChild(o.element);const i=e=>{o.setPath(t,n,e.pageX,e.pageY)},a=e=>{const d=document.elementFromPoint(e.clientX,e.clientY),l=d?d.closest(".node-input"):null;if(l){const i={output:s,input:l,svg:o,start:{x:t,y:n},end:{x:e.pageX,y:e.pageY}};s.lines.push(i),l.lines.push(i)}else o.element.remove();document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a)};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)}),t.appendChild(s)}),this.element.ondblclick=this.handleDblClickEvent.bind(this),this.element.onmousedown=this.handleMoveEvent.bind(this),this.element.oncontextmenu=this.handleRightClickEvent.bind(this),this.canvas.appendChild(this.element)}}const getCfgUI=e=>{const t=document.createElement("template");switch(e.type){case"text":t.innerHTML=`${e.name}: <input type='text' name='${e.name}' value='${e.value}' />`;break;case"number":t.innerHTML=`${e.name}: <input type='number' name='${e.name}' value='${e.value}' />`;break;case"select":const n=t=>{return`<option ${t==e.value?"selected":""}>${t}</option>`};t.innerHTML=`${e.name}: <select name='${e.name}'>${e.values.map(e=>n(e))}</select>`}return t.content.cloneNode(!0)},showConfigBox=(e,t,n)=>{const s=document.createElement("template");s.innerHTML=`\n        <div class='configbox'>\n            <div class="configbox-title">${e}</div>\n            <form class="configbox-body" name=configform>\n            </form>\n            <div class="configbox-footer">\n                <button id=ob>OK</button>\n                <button id=cb>Cancel</button>\n            </div>\n        </div>\n    `;document.body.appendChild(s.content.cloneNode(!0));const o=document.body.querySelectorAll(".configbox-body")[0],i=document.getElementById("ob");document.getElementById("cb").onclick=(()=>{o.parentElement.remove()}),i.onclick=(()=>{t.forEach(e=>{e.value=document.forms.configform.elements[e.name].value}),o.parentElement.remove(),n()}),t.forEach(e=>{const t=getCfgUI(e);o.appendChild(t)})};class FlowEditor{constructor(e,t,n){this.nodes=[],this.renderedNodes=[],this.onSave=n,this.element=document.querySelectorAll(e)[0],t.forEach(e=>{const t=new Node(e);this.nodes.push(t)}),this.render(),dNd.enableNativeDrop(this.canvas,e=>{const t=this.nodes.find(t=>t.type==e.dataTransfer.getData("type"));let n=new NodeUI(this.canvas,t,{x:e.x,y:e.y});n.render(),n.destroy=(()=>{n=null}),this.renderedNodes.push(n)})}loadConfig(e){loadChart(e,this)}renderContainers(){this.sidebar=document.createElement("div"),this.sidebar.className="sidebar",this.element.appendChild(this.sidebar),this.canvas=document.createElement("div"),this.canvas.className="canvas",this.element.appendChild(this.canvas),this.debug=document.createElement("div"),this.debug.className="debug";const e=document.createElement("span");this.debug.appendChild(e);const t=document.createElement("button");t.textContent="SAVE",t.onclick=(()=>{const e=JSON.stringify(saveChart(this.renderedNodes)),t=exportChart(this.renderedNodes);this.onSave(e,t)});const n=document.createElement("button");n.textContent="LOAD",n.onclick=(()=>{const e=prompt("enter config");loadChart(JSON.parse(e),this)});const s=document.createElement("button");s.textContent="EXPORT",s.onclick=(()=>{const t=exportChart(this.renderedNodes);e.textContent=t}),this.debug.appendChild(s),this.debug.appendChild(t),this.debug.appendChild(n),this.debug.appendChild(e),this.element.appendChild(this.debug)}renderConfigNodes(){const e={};this.nodes.forEach(t=>{if(!e[t.group]){const n=document.createElement("div");n.className="group",n.textContent=t.group,this.sidebar.appendChild(n),e[t.group]=n}const n=document.createElement("div");n.className=`node group-${t.group}`,n.textContent=t.type,e[t.group].appendChild(n),dNd.enableNativeDrag(n,{type:t.type})})}render(){this.renderContainers(),this.renderConfigNodes()}}