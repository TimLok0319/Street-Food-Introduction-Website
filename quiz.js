let quizData = [];
let currentQuestion = 0;
let score = 0;
let answers = [];
let stage = "welcome";
let lastSelected = null;

// Sections
const welcomeSection = $("#welcomeSection");
const quizSection = $("#quizSection");
const explainSection = $("#explainSection");
const resultSection = $("#resultSection");

// Elements
const questionText = $("#questionText");
const foodImage = $("#foodImage");
const answerButtons = $("#answerButtons");
const explainTitle = $("#explainTitle");
const explainImage = $("#explainImage");
const explainText = $("#explainText");
const yourAnswer = $("#yourAnswer");
const correctAnswer = $("#correctAnswer");
const finalScore = $("#finalScore");
const progressText = $("#progressText");

// --- Helpers ---
function hideAll() {
    welcomeSection.hide();
    quizSection.hide();
    explainSection.hide();
    resultSection.hide();
}

function saveState() {
    localStorage.setItem("quizState", JSON.stringify({
        currentQuestion,
        score,
        answers,
        stage,
        lastSelected
    }));
}

function clearState() {
    localStorage.removeItem("quizState");
}

// --- Show Current Section ---
function showCurrentSection() {
    hideAll();
    switch (stage) {
        case "welcome":
            welcomeSection.show();
            break;
        case "quiz":
            showQuestion();
            quizSection.show();
            break;
        case "explain":
            showExplanation();
            break;
        case "result":
            showResults();
            break;
        default:
            stage = "welcome";
            welcomeSection.show();
    }
}

// --- Load Quiz Data ---
async function loadQuizData() {
    try {
        const response = await fetch("quiz.json");
        quizData = await response.json();
    } catch (err) {
        console.error("Failed to load quiz.json", err);
        quizData = [];
    }

    // On page load/refresh, always reset the state to the welcome page.
    currentQuestion = 0;
    score = 0;
    answers = [];
    stage = "welcome";
    lastSelected = null;
    clearState(); // Also clear the saved state from localStorage

    showCurrentSection();
}

// --- Start Quiz ---
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = [];
    stage = "quiz";
    lastSelected = null;

    saveState();
    showCurrentSection();
}

// --- Show Question ---
function showQuestion() {
    if (!quizData.length) return;
    const q = quizData[currentQuestion];
    questionText.text(`${currentQuestion + 1}. ${q.question}`);
    foodImage.attr("src", q.image);
    progressText.text(`Question ${currentQuestion + 1} of ${quizData.length}`);
    answerButtons.empty();
    q.answers.forEach((ans, i) => {
        answerButtons.append(`<button class="btn w-100 mb-2 custom-answer-btn" onclick="submitAnswer(${i})">${ans}</button>`);
    });

}

// --- Submit Answer ---
function submitAnswer(index) {
    const q = quizData[currentQuestion];
    const isCorrect = index === q.correct;
    answers[currentQuestion] = {
        selected: index,
        correct: isCorrect
    };
    if (isCorrect) score++;
    stage = "explain";
    lastSelected = index;
    saveState();
    showExplanation();
}

// --- Show Explanation ---
function showExplanation() {
    const q = quizData[currentQuestion];
    hideAll();
    explainTitle.text(q.question);
    explainImage.attr("src", q.image);
    explainText.text(q.explanation);

    if (lastSelected === q.correct) {
        yourAnswer.html(`Your Answer: ${q.answers[lastSelected]} ✅`).removeClass("text-danger").addClass("text-success");
        correctAnswer.text("");
    } else {
        yourAnswer.html(`Your Answer: ${q.answers[lastSelected]} ❌`).removeClass("text-success").addClass("text-danger");
        correctAnswer.text(`Correct Answer: ${q.answers[q.correct]}`);
    }

    explainSection.show();
}

// --- Next Button ---
$("#nextBtn").click(() => {
    if (stage !== "explain") {
        alert("Please answer the question first!");
        return;
    }

    currentQuestion++;
    if (currentQuestion < quizData.length) {
        stage = "quiz";
    } else {
        stage = "result";
    }

    saveState();
    showCurrentSection();
});

// --- Show Results ---
function showResults() {
    hideAll();
    const total = quizData.length;
    const correct = score;
    const incorrect = total - correct;

    // Show score
    finalScore.html(`${correct} correct / ${incorrect} incorrect`);

    // Fill into share snapshot
    $("#playerScore").text(`${correct} / ${total}`);
    $("#playerName").text("Foodie"); // later can link with login name

    // Accuracy %
    const correctPercent = (correct / total) * 100;
    $(".accuracy-bar-fill-correct").css("width", `${correctPercent}%`);
    $(".accuracy-bar-fill-wrong").css("width", `${100 - correctPercent}%`);
    $("#accuracyLabel").text(`Accuracy: ${Math.round(correctPercent)}%`);

    // 👇 New performance-based tagline
    let tagline = "";
    if (correctPercent >= 80) {
        tagline = "🍜 Penang Food Master! You know your Char Koay Teow from your Laksa!";
    } 
    else if (correctPercent >= 50) {
        tagline = "🌶️ Not bad! But you still need more street food adventures!";
    } 
    else {
        tagline = "😋 Time to makan more! Discover Penang’s famous dishes with us!";
    }
    $("#resultTagline").text(tagline);

    resultSection.show();
}

function shareResult() {
  // Copy resultSnapshot content into shareContent
  $("#shareContent").html($("#resultSnapshot").html());

  const shareModal = new bootstrap.Modal(document.getElementById("shareModal"));
  shareModal.show();

  // Save button (capture ONLY branded shareSnapshot)
  $("#saveResultBtn").off("click").on("click", () => {
    const element = document.getElementById("shareSnapshot");

    html2canvas(element, {
      backgroundColor: "#fff",
      scale: 2,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "quiz-result.png";
      link.click();
    });
  });
}


// --- Restart Quiz ---
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = [];
    stage = "welcome";
    lastSelected = null;
    clearState();
    showCurrentSection();
}

// --- Init ---
$(document).ready(loadQuizData);
