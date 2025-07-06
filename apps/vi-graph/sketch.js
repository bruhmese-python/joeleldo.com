// https://sites.google.com/view/5s3h8j2f9l6k4q7d5g2h8s3j6r2k5f/home
let Nodes= [];
let curNode= null;
let copiedNode = null;
let mode = "Selection";
let file_name = "";
let file_name_counter = 1;

const nodeHeight = 30, nodeWidth = 80;
const ARROW_OFFSET_SIZE = 5;
const NORMAL_STROKE_WEIGHT = 1;
const BOLD_STROKE_WEIGHT = 3;

let gotoNodeNumber = "";

const DISPLACEMENT = 10;
let PEEK_NUMBERS = false;

class Node {
  // Constructor to initialize the properties
  constructor(x, y, width, height, text, parent=null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.selected = true;
    this.parents = [];
    this.parents.push(parent);
    this.isText = false;
  }

  // Method to display node details
  displayInfo() {
    return `Node at (${this.x}, ${this.y}) with dimensions ${this.width}x${this.height} and text: "${this.text}"`;
  }

  // Method to calculate the area of the node
  getArea() {
    return this.width * this.height;
  }

  // Method to move the node
  move(newX, newY) {
    this.x = newX;
    this.y = newY;
  }
  drawthis(notes) {

    noStroke();
    if(this.isText)
      fill(0, 0, 0, 0); // Light blue color
    else{
      // Set the fill color for the rectangle
      fill(200, 200, 250); // Light blue color
    
      // Draw the rectangle
      rect(this.x, this.y, this.width, this.height);
    }
    
    //peek indices
    if(PEEK_NUMBERS){
      fill('red'); 
      textSize(10);
      text(notes,this.x + 10,this.y + 10)
      fill(0, 0, 0, 0); // Reset fill to Light blue color
    }
    
    if(this.selected){
      strokeWeight(BOLD_STROKE_WEIGHT);
      if(mode==="Translate")
        stroke('red');
      else if(mode==="Insertion")
        stroke('blue');
      else if(mode==="Join")
        stroke('green');
      else
        stroke('purple');
    }else{
      strokeWeight(NORMAL_STROKE_WEIGHT);
      if(!this.isText)
        stroke('black');
    }
    rect(this.x + 2 , this.y + 2, this.width - 4, this.height - 4);
    noStroke();    
    // Set the text size and color
    textSize(16);
    fill(0); // Black color
    
    // Center the text inside the rectangle
    textAlign(CENTER, CENTER);
    text(this.text, this.x + this.width / 2, this.y + this.height / 2);   
  }
}

function openFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      file_name = file.name; 
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          loadGraph(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

function loadGraph(data) {
  Nodes = []; // Clear existing nodes
  curNode = null; // Reset current node
  
  // Assume `data` has a format like { nodes: [...], edges: [...] }
  if (data.nodes) {
    data.nodes.forEach(nodeData => {
      const node = new Node(nodeData.x, nodeData.y, nodeData.width, nodeData.height, nodeData.text);
      Nodes.push(node);
    });
  }

  if (data.edges) {
    data.edges.forEach(edge => {
      const parentNode = Nodes[edge.parentIndex];
      const childNode = Nodes[edge.childIndex];
      if (parentNode) {
        childNode.parents.push(parentNode);
      }
    });
  }
  
  // Set the current node to the first node (if available)
  curNode = Nodes.length > 0 ? Nodes[0] : null;
}

function saveGraph() {
  const data = {
    nodes: Nodes.map(node => ({
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      text: node.text
    })),
    edges: []
  };

  Nodes.forEach((node, index) => {
    node.parents.forEach(parent => {
      const parentIndex = Nodes.indexOf(parent);
      if (parentIndex !== -1) {
        data.edges.push({
          parentIndex: parentIndex,
          childIndex: index
        });
      }
    });
  });

  const json = JSON.stringify(data, null, 2);
  let json_file_name;
  if(file_name=="")
    json_file_name = `vigraph-${new Date().toISOString().replace(/[:-]/g, '').split('.')[0]}.json`;
  else{
    // json_file_name = `${file_name}(${file_name_counter})`;
    json_file_name = `${file_name.replace(/\.[^/.]+$/, "")}(${file_name_counter}).json`;
    file_name_counter+=1;
  }
    
  downloadJson(json, json_file_name);

}

function downloadJson(json, filename) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


async function copyOutputToClipboard(data) {
    try {
        // Copy the variable's value to the clipboard
        // await navigator.clipboard.writeText(data);
      document.getElementById("output-area").value=data;

        // Show the modal
        document.getElementById("modal").style.display = "block";
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function toGraphviz(){
  output = 'strict digraph {\n';
  //nodes
  for(i=0;i<Nodes.length;i++){
    if(!Nodes[i].isText){
      node = Nodes[i];
      output += "\"" + node.text + "\"\n";
    }
  }

  //connectors
  for(i =0;i<Nodes.length;i++){
      for(j =0;j<Nodes[i].parents.length;j++){
        let previousNode = Nodes[i].parents[j];
        let myNode = Nodes[i];
        if(previousNode!==null){
          output += `"${previousNode.text}" -> "${myNode.text}"\n`;
        }
          
      }  
    }
  
  output += '}';
  return output;
}

function makeDuplicate(copiedNode){
    var tempNode;
    if(curNode!=null){
      tempNode = new Node(curNode.x + 20, curNode.y + 20, copiedNode.width, copiedNode.height, copiedNode.text);
      tempNode.parents = [...copiedNode.parents];
      //need to copy parents
    }
    else{
      tempNode = new Node(mouseX, mouseY , copiedNode.width, copiedNode.height, copiedNode.text);
    }
    Nodes.push(tempNode);
    curNode = tempNode;
    console.log("inserting node");
}

var dummyNode = new Node(10, 20, nodeWidth, nodeHeight, 'Hello!',null);

function selectPrevious(n){
  for(i=0;i<Nodes.length;i++){
    tNode = Nodes[i];
    if(tNode===n){
      if(i>0 && Nodes[i-1]!==null){
        curNode = Nodes[i-1];
        console.log('setting previous node with i:',i);
      }
      return;
    }
  }
}

function selectNext(n){
  for(i=0;i<Nodes.length;i++){
    tNode = Nodes[i];
    if(tNode===n){
      if(i<Nodes.length -1  && Nodes[i+1]!==null){
        curNode = Nodes[i+1];
        console.log('setting next node with i:',i);
      }
      return;
    }
  }
}
function removeNode(node) {
  let i;
  
  // Find and remove node from Nodes array
  for (i = 0; i < Nodes.length; i++) {
    if (Nodes[i] === node) {
      break;
    }
  }
  Nodes.splice(i, 1);
  
  // Reassign parents to the node's children before removing references
  for (let child of Nodes) {
    let parentIndex = child.parents.indexOf(node);
    if (parentIndex !== -1) {
      child.parents.splice(parentIndex, 1); // Remove node as a parent
      
      // Add node's parents to its children
      for (let parent of node.parents) {
        if (!child.parents.includes(parent)) {
          child.parents.push(parent);
        }
      }
    }
  }
}

function setMode(modeString){
  mode = modeString;
  document.getElementById('mode').innerHTML = modeString;
}
function updateStatusBarForGoto(gotoNodenumber,reset = false){
  if(!reset)
    document.getElementById('mode').innerHTML += gotoNodenumber;
  else
    document.getElementById('mode').innerHTML = mode;
}

function setup() {
  createCanvas(windowWidth,windowWidth);
  Nodes.push(dummyNode);
  curNode = dummyNode;
}

function draw() {
  background(220);  
  textSize(20);
  fill(100);
  
  //safety checks
  // if(curNode==null){
    // curNode = dummyNode;
  // }
  
  //draw
  if(Nodes.length == 0){
    noStroke();
    text('Press \'a\' to add node', width/2, height/2);
    stroke("black");
    
  }else{
    for(i =0;i<Nodes.length;i++){
      for(j =0;j<Nodes[i].parents.length;j++){
        let previousNode = Nodes[i].parents[j];
        // print("[",i,"]"," previousNode:",previousNode)
        let myNode = Nodes[i];
        if(previousNode!==null){
          
          x1 = {x:previousNode.x + previousNode.width/2,
                y:previousNode.y + previousNode.height/2
               };
          x2 = {x:myNode.x,
                y:myNode.y + nodeHeight/2
               };
          isLeft = (x2.x<x1.x)
          
          displacement = isLeft*nodeWidth
          x2.x+=displacement
          
          stroke('black');
          strokeWeight(NORMAL_STROKE_WEIGHT);
          
          
          X1 = x1.x
          Y1 = x1.y
          X2 = x2.x
          Y2 = x2.y          

  // Calculate direction vector
  let dx = X2 - X1;
  let dy = Y2 - Y1;
  
  // Calculate the magnitude of the direction vector
  let len = sqrt(dx * dx + dy * dy);
  
  // Control point distance factor (adjust this to control the curve)
  let t = 0.2; // Smaller value for smooth curves, adjust to control curviness
  
  // Create perpendicular direction vector
  let perpX = ((isLeft==0)*-1)*dy;  // Perpendicular to the direction vector
  let perpY = ((isLeft==1)*-1)*dx;
  
  // Normalize the perpendicular vector to ensure consistent curvature
  let perpLen = sqrt(perpX * perpX + perpY * perpY);
  perpX /= perpLen;
  perpY /= perpLen;
  
  // Apply t to control how far out the control points are placed along the perpendicular vector
  let controlDist = len * t;  // Scale the perpendicular vector
  
  // Calculate control points
  let controlX1 = X1 + perpX * controlDist;
  let controlY1 = Y1 + perpY * controlDist;
  
  let controlX2 = X2 + perpX * controlDist;
  let controlY2 = Y2 + perpY * controlDist;
  
  // Draw the Bezier curve
  stroke(0);
  noFill();
  bezier(X1, Y1, controlX1, controlY1, controlX2, controlY2, X2, Y2);
          
          //line(x1.x,x1.y,x2.x,x2.y);
          // line(previousNode.x + previousNode.width/2,previousNode.y + previousNode.height/2,myNode.x+ myNode.width/2,myNode.y + myNode.height/2);
          
          push() //start new drawing state
          var angle = atan2(x1.y - x2.y, x1.x - x2.x); //gets the angle of the line
          translate(x2.x, x2.y); //translates to the destination vertex
          rotate(atan2(controlY2 - Y1, controlX2 - X1)); //rotates the arrow point
          fill(0)
          triangle(-ARROW_OFFSET_SIZE*0.5, ARROW_OFFSET_SIZE, ARROW_OFFSET_SIZE*0.5, ARROW_OFFSET_SIZE, 0, -ARROW_OFFSET_SIZE/2); //draws the arrow point as a triangle
          // triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2); //draws the arrow point as a triangle
          pop();
        }
      }  
    }
    // let previousNode=null;
    for(i =0;i<Nodes.length;i++){
      //selection bounds
      if(curNode!==Nodes[i])
        Nodes[i].selected=false;
      else
        Nodes[i].selected=true;
      var myNode = Nodes[i];
      // console.log(myNode.displayInfo());

      //node
      myNode.drawthis(i);
    }
  }
  
  if(mode === "Translate"){
    // 106 107 104 108 
    if (keyIsDown(74) === true){
      curNode.y+= DISPLACEMENT;
    }
    if (keyIsDown(75) === true){
      curNode.y-= DISPLACEMENT;
    }
    if (keyIsDown(72) === true){
      curNode.x-= DISPLACEMENT;
    }
    if (keyIsDown(76) === true){
      curNode.x+= DISPLACEMENT;
    }
  }
}

function keyPressed(){
  //keybindings
  if(mode === "Selection"){
    //new node
    if (key === 'a') {
      setMode("Insertion");
      // Nodes.push();
      var tempNode;
      if(curNode!=null)
        tempNode = new Node(curNode.x + 20, curNode.y + 20, nodeWidth, nodeHeight, '',curNode);
      else{
        tempNode = new Node(mouseX, mouseY , nodeWidth, nodeHeight, '');
        console.log("adding independant node");
      }
      Nodes.push(tempNode);
      curNode = tempNode;
      console.log("inserting node");
    }
    //editing node text
    else if(key ==='s'){
      //saving project
      // if(keyIsDown(CONTROL)){
        // saveGraph();
      // }else{
        setMode("Insertion");
        curNode.text='';
      // }
    }
    else if(key ==='i'){
      setMode("Insertion");
    }else if(key === 'g'){
      setMode("Goto");
      PEEK_NUMBERS = true;
    }else if(key ==='J'){
      setMode("Join"); //aka set parent
      PEEK_NUMBERS = true;
    }else if(key ==='X'){
      setMode("Remove Parent"); //aka set parent
      PEEK_NUMBERS = true;
    }else if(key ==='d'){
      removeNode(curNode);
      curNode = Nodes[Nodes.length-1];
    }else if(keyCode === ENTER){  
      setMode("Translate");
    }else if(key === 'b'){
      selectPrevious(curNode);
    }else if(key === 'e'){
      selectNext(curNode);
    }
    //convert to text
    else if(key === 't'){
      curNode.isText=!curNode.isText;
    }
    //copy
    else if(key === 'y'){
      copiedNode= curNode;
    }
    //paste
    else if(key === 'p'){
      if(copiedNode!==null){
        makeDuplicate(copiedNode);
        setMode("Translate");
      }
    }    
    //escape selection
    else if(keyCode ===ESCAPE){
      curNode = null;
    }
    //save output
    else if(key === 'w'){
      // copyOutputToClipboard(toGraphviz());
      // console.log(toGraphviz());
        saveGraph();
    }
    else if (key === 'o') {
      openFile();
    }

    
  }else  if(mode === "Translate"){
    //submit new position
    if(keyCode ===ENTER || keyCode ===ESCAPE){
      setMode("Selection");
      //print('enter');
    }
  }else if(mode === "Insertion"){
     if(keyCode ===ESCAPE){
      setMode("Selection");
     }else if(keyCode ===BACKSPACE){
       //remove last word
       if(keyIsDown(CONTROL))
         curNode.text = curNode.text.split(' ').slice(0, -1).join(' ');
       //remove last character
        else
         curNode.text = curNode.text.slice(0, -1);
     }
    //submit node text
    else if(keyCode ===ENTER){
      setMode("Translate");
      //print('enter');
    }
    //eatables
    else if(keyCode===SHIFT){
      //do nothing
    }else{
      curNode.text+=key;
    }
  }else if(mode === "Goto"){
    if(keyCode ===ENTER || keyCode ===ESCAPE){
      curNode = Nodes[parseInt(gotoNodeNumber)];
      //ESCAPE boilerplate
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else if(keyCode ===BACKSPACE){
      gotoNodeNumber=""; 
      updateStatusBarForGoto("",true);
    }else if(keyCode ===ESCAPE){
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else {
      gotoNodeNumber+=key;
      updateStatusBarForGoto(key);
    }
  }else if(mode === "Join"){
    if(keyCode ===ENTER){
      newChild = Nodes[parseInt(gotoNodeNumber)];
      if(curNode!==null)
        newChild.parents.push(curNode);
      //ESCAPE boilerplate
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else if(keyCode ===ESCAPE){
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else {
      gotoNodeNumber+=key;
      updateStatusBarForGoto(key);
    }
  }else if(mode === "Remove Parent"){
    if(keyCode ===ENTER){
      parentToRemove = Nodes[parseInt(gotoNodeNumber)];
      if(curNode!==null){
        for (let i=0;i<curNode.parents.length;i++){
          if(curNode.parents[i] ==parentToRemove){
            curNode.parents.splice(i, 1);
            break;
          }
        }
      }
      
      //ESCAPE boilerplate
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else if(keyCode ===ESCAPE){
      gotoNodeNumber=""; //reset
      PEEK_NUMBERS = false;
      setMode("Selection");
    }else {
      gotoNodeNumber+=key;
      updateStatusBarForGoto(key);
    }
  }
}
