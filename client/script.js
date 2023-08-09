import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//this function gonna repeat every 300 ms
//used for when loading
function loader(element){
  element.textContent = '';

  loadInterval = setInterval(()=>{
    element.textContent += '.';

    if(element.textContent === '....'){
      element.textContent = '';
    }
  },300)
}

// typing functionality(mean typing answer word by word)
function typeText(element,text){
  let index = 0;

  let interval = setInterval(()=>{
    if (index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}

//unique id for every single message
function generateUniqueID(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimal = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimal}`;
}

//complete view strip of AI 
//AI generated message showing
function chatStripe(isAI, value, uniqueId){
 return(
  `
  <div class="wrapper ${isAI && 'ai'}">
  <div class="chat">
  <div class="profile">
  <img src="${isAI ? bot : user}"
  alt = "${isAI ? 'bot' : 'user'}">
  </div>
    <div class = "message" id = "${uniqueId}">${value}</div>
  </div>
  </div>
  `
 ) 
}

//Ai generated responce triger
const handleSubmit = async(e) => {
  e.preventDefault();//for preventing default setting of reloading of browser on requesting responce 

  const data = new FormData(form);

  //user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt')) ;
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, "",uniqueId) ;
  //for continue moving screen as result showing
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from server -> bot's responce
  try{
    const responce = await fetch('http://localhost:5000',{
    method:'POST',
    headers:{
      'Content-Type' : 'application/json'
    },
    body:JSON.stringify({
      prompt:data.get('prompt')
    })
  })
  console.log(responce);
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(responce.ok){
    const data = await responce.json();
    const ParsedData = data.bot.trim();

    typeText(messageDiv,ParsedData);
  }else{
    const err = await responce.text();
    messageDiv.innerHTML = "Something went wrong!";

    alert(err);
  }
  }
  catch{
    console.log("error at 96");
  }
  
}

form.addEventListener('submit',handleSubmit);
//for subiting the form using enter key
form.addEventListener('keyup',(e) =>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
});