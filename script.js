const questions = [  
    {
        question: "What is the output of the following code?",
        code: `#include <iostream>
using namespace std;

int main() {
  int arr[] = {1, 2, 3, 4, 5};
  cout << arr[3];
  return 0;
}`,
        options: ["1", "2", "3", "4", "5"],
        correct: 3,
        hint: "Pay attention to the index being accessed in the array."
    },
    {
        question: "What is the error in the following code?",
        code: `#include <iostream>
using namespace std;

void func() {
  cout << "Hello";
}

int main() {
  func;
  return 0;
}`,
        options: [
            "func should be func().",
            "cout is not defined.",
            "void func() should be int func().",
            "return 0; is incorrect.",
            "cin is not defined."
        ],
        correct: 0,
        hint: "Pay attention to how the function is called."
    },
    {
        question: "What is the error in the following code?",
        code: `#include <iostream>
using namespace std;

void showMessage() {
  cout << "Hello";
}

int main() {
  showMessage();
  return "Done";
}`,
        options: [
            "cout is not defined.",
            "void showMessage() should be int showMessage().",
            "showMessage() should be showMessage;.",
            "return should be return 0;.",
            "cin is not defined."
        ],
        correct: 3,
        hint: "Pay attention to the return type of the main function."
    },
    {
        question: "What is the output of the following code?",
        code: `#include <iostream>
using namespace std;

int main() {
  int a = 10, b = 3;
  cout << a % b;
  return 0;
}`,
        options: ["0", "1", "2", "3", "4"],
        correct: 1,
        hint: "Pay attention to the modulus operation."
    },
    {
        question: "Complete the code to create a function that prints 'Welcome'?",
        code: `#include <iostream>
using namespace std;

____ welcome() {
  cout << "Welcome";
}`,
        options: ["int", "string", "void", "char"],
        correct: 2,
        hint: "Pay attention to the function type that does not return a value."
    },
    {
        question: "What is the output of the following code?",
        code: `#include <iostream>
using namespace std;

void AKOUSH(int &x) {
  x = 10;
}

int main() {
  int a = 5;
  AKOUSH(a);
  cout << a;
  return 0;
}`,
        options: ["5", "10", "15", "20", "25"],
        correct: 1,
        hint: "Pay attention to how the variable is passed by reference."
    },
    {
        question: "What is the output of the following code?",
        code: `#include <iostream>
using namespace std;

int main() {
  int arr[4] = {1, 2, 3, 4};
  for (int i = 0; i < 4; i++) {
    arr[i] = arr[(i + 1) % 4];
  }
  for (int i = 0; i < 4; i++) {
    cout << arr[i] << " ";
  }
  return 0;
}`,
        options: [
            "1 2 3 4",
            "4 1 2 3",
            "3 4 1 2",
            "2 3 4 1",
            "1 3 2 4"
        ],
        correct: 3,
        hint: "Pay attention to how the array elements are modified within the loop."
    }
];

let currentQuestion = 0;
let lives = 3;
let hintClickCount = 0;
let userName = "";
let userMobile = "";
let correctAnswers = 0;
let score = 0;
let hintUsed = false;
let timeLeft = 600; // 10 دقايق بالثواني
let timerInterval = null;

const questionElem = document.getElementById("question");
const codeSnippetElem = document.getElementById("code-snippet");
const optionsElem = document.getElementById("options");
const feedbackElem = document.getElementById("feedback");
const hintElem = document.getElementById("hint");
const chicksElem = document.getElementById("chicks");
const quizContainer = document.getElementById("quizContainer");
const popup = document.getElementById("popup");
const scoreDisplay = document.getElementById("score-display");
const pointsNotification = document.getElementById("points-notification");
const timerElem = document.getElementById("timer");

function startQuiz() {
    const fullName = document.getElementById("fullName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();

    const nameParts = fullName.split(" ");
    if (nameParts.length !== 3) {
        alert("Please enter your full triple name (e.g., First Second Third)!");
        return;
    }
    if (!/^\d{10,15}$/.test(mobile)) {
        alert("Please enter a valid mobile number (10-15 digits)!");
        return;
    }

    userName = fullName;
    userMobile = mobile;
    popup.style.display = "none";
    quizContainer.style.display = "block";
    startTimer(); // بدء العداد
    loadQuestion();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElem.innerText = `Time Left: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        
        // تحذير لما الوقت يقل عن دقيقة
        if (timeLeft <= 60) {
            timerElem.classList.add("warning");
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endExamDueToTime();
        }
    }, 1000);
}

function checkDeviceAccess() {
    const deviceId = localStorage.getItem("examDeviceId");
    if (!deviceId) {
        const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("examDeviceId", uniqueId);
        return true;
    }
    if (localStorage.getItem("examCompleted") === "true") {
        questionElem.innerText = "Access Denied: One attempt per device!";
        codeSnippetElem.innerHTML = "";
        optionsElem.innerHTML = "";
        hintElem.classList.add("hidden");
        chicksElem.innerHTML = "";
        return false;
    }
    return true;
}

function updateChicks() {
    const chicks = chicksElem.querySelectorAll(".chick");
    chicks.forEach((chick, index) => {
        if (index >= lives) {
            chick.classList.add("lost");
        } else {
            chick.classList.remove("lost");
        }
    });
}

function updateScoreDisplay() {
    scoreDisplay.innerText = `Score: ${score.toFixed(1)}`;
}

function showPointsNotification(points) {
    pointsNotification.innerText = `+${points.toFixed(1)} Points!`;
    pointsNotification.classList.remove("hidden");
    setTimeout(() => {
        pointsNotification.classList.add("hidden");
    }, 1500);
}

function loadQuestion() {
    if (!checkDeviceAccess()) return;

    if (lives <= 0) {
        endExamDueToLives();
        return;
    }

    if (currentQuestion >= questions.length) {
        if (correctAnswers === questions.length) {
            questionElem.innerText = `تهانينا ${userName}! لقد أتقنت الاختبار بنجاح! النقاط: ${score.toFixed(1)}`;
            sendWhatsAppMessage();
        } else {
            questionElem.innerText = `Mission Complete: Quiz Mastered! النقاط: ${score.toFixed(1)}`;
        }
        codeSnippetElem.innerHTML = "";
        optionsElem.innerHTML = "";
        hintElem.classList.add("hidden");
        chicksElem.innerHTML = "";
        scoreDisplay.style.display = "none";
        timerElem.style.display = "none";
        clearInterval(timerInterval);
        return;
    }

    hintUsed = false;
    const q = questions[currentQuestion];
    questionElem.innerText = q.question;
    
    // عرض الكود كنص خام مع الحفاظ على التنسيق
    codeSnippetElem.textContent = q.code;
    
    hintElem.innerText = q.hint;
    hintElem.classList.add("hidden");
    optionsElem.innerHTML = "";
    q.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "btn p-2 shadow-lg";
        btn.innerText = option;
        btn.onclick = () => checkAnswer(index, q.correct);
        optionsElem.appendChild(btn);
    });
    updateChicks();
    updateScoreDisplay();
}

function checkAnswer(selected, correct) {
    let points = lives;
    if (hintUsed) points -= 0.5;

    if (selected === correct) {
        feedbackElem.innerHTML = "✅ <span class='success'>Code Cracked!</span>";
        correctAnswers++;
        score += points;
        showPointsNotification(points);
        setTimeout(() => {
            feedbackElem.innerHTML = "";
            currentQuestion++;
            loadQuestion();
        }, 1000);
    } else {
        lives--;
        feedbackElem.innerHTML = "❌ <span class='wrong'>System Failure!</span>";
        setTimeout(() => {
            feedbackElem.innerHTML = "";
            loadQuestion();
        }, 1000);
    }
}

function endExamDueToLives() {
    questionElem.innerText = `حظ أوفر المرة القادمة ${userName}! النقاط: ${score.toFixed(1)}`;
    codeSnippetElem.innerHTML = "";
    optionsElem.innerHTML = "";
    hintElem.classList.add("hidden");
    chicksElem.innerHTML = "";
    scoreDisplay.style.display = "none";
    timerElem.style.display = "none";
    clearInterval(timerInterval);
    localStorage.setItem("examCompleted", "true");
}

function endExamDueToTime() {
    questionElem.innerText = `انتهى الوقت ${userName}! النقاط: ${score.toFixed(1)}`;
    codeSnippetElem.innerHTML = "";
    optionsElem.innerHTML = "";
    hintElem.classList.add("hidden");
    chicksElem.innerHTML = "";
    scoreDisplay.style.display = "none";
    timerElem.style.display = "none";
    localStorage.setItem("examCompleted", "true");
}

function resetExam() {
    lives = 3;
    currentQuestion = 0;
    correctAnswers = 0;
    score = 0;
    timeLeft = 600;
    localStorage.removeItem("examCompleted");
    hintClickCount = 0;
    chicksElem.innerHTML = `
        <span class="chick">🐥</span>
        <span class="chick">🐥</span>
        <span class="chick">🐥</span>
    `;
    timerElem.innerText = `Time Left: 10:00`;
    timerElem.classList.remove("warning");
    clearInterval(timerInterval);
    loadQuestion();
}

function showHint() {
    hintElem.classList.toggle("hidden");
    if (!hintUsed) {
        hintUsed = true;
    }
    hintClickCount++;
    if (hintClickCount >= 5) {
        resetExam();
    }
}

async function sendWhatsAppMessage() {
    const recipientNumber = "+201011728299";
    const message = `الفائز: ${userName}\nرقم الهاتف: ${userMobile}\nالنقاط: ${score.toFixed(1)}`;
    
    try {
        const response = await fetch('https://webhook.site/your-unique-webhook-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: recipientNumber,
                message: message
            })
        });
        if (response.ok) {
            console.log("Message sent successfully!");
        } else {
            console.error("Failed to send message.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${recipientNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const icon = document.querySelector(".theme-toggle i");
    icon.classList.toggle("fa-moon");
    icon.classList.toggle("fa-sun");
}