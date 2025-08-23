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

    // Restore saved state
    const saved = JSON.parse(localStorage.getItem("quizState"));
    if (saved) {
        currentQuestion = saved.currentQuestion ?? 0;
        score = saved.score ?? 0;
        answers = saved.answers ?? [];
        stage = saved.stage ?? "welcome";
        lastSelected = saved.lastSelected ?? null;
    } else {
        stage = "welcome"; // ensure welcome page shows
    }

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

    // Show score text
    finalScore.html(`${correct} correct / ${incorrect} incorrect`);

    // Calculate percentages
    const correctPercent = (correct / total) * 100;
    const wrongPercent = (incorrect / total) * 100;

    // Update bar widths
    $(".accuracy-bar-fill-correct").css("width", `${correctPercent}%`);
    $(".accuracy-bar-fill-wrong").css("width", `${wrongPercent}%`);

    // Optional: label
    $("#accuracyLabel").text(`Accuracy: ${Math.round(correctPercent)}%`);

    resultSection.show();
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
