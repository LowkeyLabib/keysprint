const wordsContainer=document.getElementById("words")
const input=document.getElementById("input")
const timeDisplay=document.getElementById("time")
const wpmDisplay=document.getElementById("wpm")
const restartBtn=document.getElementById("restartBtn")
const timeSelect=document.getElementById("timeSelect")

const resultModal=document.getElementById("resultModal")
const finalWpm=document.getElementById("finalWpm")
const finalAccuracy=document.getElementById("finalAccuracy")
const modalRestartBtn=document.getElementById("modalRestartBtn")

let selectedTime=parseInt(timeSelect.value)
let timeLeft=selectedTime
let timer=null
let started=false

let currentWordIndex=0
let correctChars=0
let totalChars=0
let words=[]

let rawWpm=0
let displayedWpm=0

function getRandomWords(count){
let arr=[]
for(let i=0;i<count;i++){
arr.push(WORDS[Math.floor(Math.random()*WORDS.length)])
}
return arr
}

function renderWords(){
wordsContainer.innerHTML=""

words.forEach((word,index)=>{

const span=document.createElement("span")
span.textContent=word
span.classList.add("word")

if(index===currentWordIndex){
span.classList.add("current")
}

wordsContainer.appendChild(span)

})
}

function calculateStats(){

const elapsed=(selectedTime-timeLeft)/60

if(elapsed<=0)return{wpm:0,accuracy:100}

const gross=(totalChars/5)/elapsed
const accuracy=totalChars>0?correctChars/totalChars:1
const final=gross*accuracy

return{
wpm:Math.round(final),
accuracy:Math.round(accuracy*100)
}

}

function smoothWpm(){

displayedWpm+= (rawWpm-displayedWpm)*0.12

wpmDisplay.textContent=Math.round(displayedWpm)

requestAnimationFrame(smoothWpm)

}

smoothWpm()

function startTimer(){

timer=setInterval(()=>{

timeLeft--

timeDisplay.textContent=timeLeft

rawWpm=calculateLiveWpm()

if(timeLeft<=0){

clearInterval(timer)

input.disabled=true

const stats=calculateStats()

finalWpm.textContent=stats.wpm
finalAccuracy.textContent=stats.accuracy+"%"

resultModal.classList.remove("hidden")

}

},1000)

}

function calculateLiveWpm(){

const typed=input.value
const expected=words[currentWordIndex]||""

const elapsed=(selectedTime-timeLeft)/60

if(elapsed<=0)return 0

let tempCorrect=correctChars
let tempTotal=totalChars+typed.length

for(let i=0;i<typed.length;i++){
if(typed[i]===expected[i]) tempCorrect++
}

const gross=(tempTotal/5)/elapsed
const accuracy=tempTotal>0?tempCorrect/tempTotal:1

return gross*accuracy

}

function moveNext(isCorrect,typedWord,expectedWord){

const spans=document.querySelectorAll(".word")

spans[currentWordIndex].classList.remove("current")
spans[currentWordIndex].classList.add(isCorrect?"correct":"wrong")

totalChars+=typedWord.length

if(isCorrect){
correctChars+=expectedWord.length
}else{

for(let i=0;i<typedWord.length;i++){
if(typedWord[i]===expectedWord[i])correctChars++
}

}

currentWordIndex++

if(currentWordIndex>=words.length){

words=words.concat(getRandomWords(40))
renderWords()

}else{

document.querySelectorAll(".word")[currentWordIndex].classList.add("current")

}

input.value=""

rawWpm=calculateLiveWpm()

}

input.addEventListener("input",()=>{

if(!started){

started=true
startTimer()

}

const typed=input.value

if(typed.includes(" ")){

const word=typed.trim()
const expected=words[currentWordIndex]

if(word.length>0){

moveNext(word===expected,word,expected)

}else{

input.value=""

}

}else{

rawWpm=calculateLiveWpm()

}

})

function resetGame(){

clearInterval(timer)

selectedTime=parseInt(timeSelect.value)
timeLeft=selectedTime

started=false

currentWordIndex=0
correctChars=0
totalChars=0

rawWpm=0
displayedWpm=0

timeDisplay.textContent=timeLeft
wpmDisplay.textContent="0"

input.disabled=false
input.value=""
input.focus()

resultModal.classList.add("hidden")

words=getRandomWords(80)

renderWords()

}

restartBtn.onclick=resetGame
modalRestartBtn.onclick=resetGame

timeSelect.onchange=resetGame

resetGame()