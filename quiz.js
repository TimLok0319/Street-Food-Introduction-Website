// --- Quiz Data ---
let quizData = []; // will be loaded from JSON

// Load quiz data from local quiz.json
async function loadQuizData() {
  try {
    const response = await fetch("quiz.json");
    quizData = await response.json();
    console.log("Quiz data loaded:", quizData);

    // Restore state AFTER quizData is ready
    loadState();
  } catch (err) {
    console.error("Failed to load quiz data", err);
  }
}

// Call on page load
loadQuizData();

// --- Global state ---
let currentQuestion = 0;
let score = 0;
let answers = []; // store selected answers
let stage = "welcome"; // "welcome", "quiz", "explain", "result"
let lastSelected = null;

// --- Sections ---
const welcomeSection = $("#welcomeSection");
const quizSection = $("#quizSection");
const explainSection = $("#explainSection");
const resultSection = $("#resultSection");

// --- Elements ---
const questionText = $("#questionText");
const foodImage = $("#foodImage");
const answerButtons = $("#answerButtons");
const explainTitle = $("#explainTitle");
const explainImage = $("#explainImage");
const explainText = $("#explainText");
const yourAnswer = $("#yourAnswer");
const correctAnswer = $("#correctAnswer");
const finalScore = $("#finalScore");
const rankingList = $("#rankingList");
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

function loadState() {
    const state = JSON.parse(localStorage.getItem("quizState"));
    if (!state) return;
    ({
        currentQuestion,
        score,
        answers,
        stage,
        lastSelected
    } = state);

    if (stage === "quiz") {
        hideAll();
        showQuestion();
        quizSection.show();
    } else if (stage === "explain") {
        hideAll();
        showExplanation();
        explainSection.show();
    } else if (stage === "result") {
        hideAll();
        showResults();
    }
}

// --- Flow ---
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = [];
    stage = "quiz";
    lastSelected = null;

    hideAll();
    showQuestion();
    quizSection.show();
    saveState();
}

function showQuestion() {
    const q = quizData[currentQuestion];
    questionText.text(`${currentQuestion + 1}. ${q.question}`);
    foodImage.attr("src", q.image);
    progressText.text(`Question ${currentQuestion + 1} of ${quizData.length}`);

    answerButtons.empty();
    q.answers.forEach((ans, index) => {
        answerButtons.append(`
      <button class="btn btn-outline-primary w-100 mb-2" onclick="submitAnswer(${index})">
        ${ans}
      </button>
    `);
    });
    saveState();
}

function submitAnswer(index) {
    const q = quizData[currentQuestion];
    const isCorrect = index === q.correct;

    if (!answers[currentQuestion]) {
        answers[currentQuestion] = {
            selected: index,
            correct: isCorrect
        };
        if (isCorrect) score++;
    }

    // Always go to explanation page
    stage = "explain";
    lastSelected = index;
    showExplanation();
    saveState();
}

function showExplanation() {
    const q = quizData[currentQuestion];
    const sel = lastSelected;

    hideAll();
    explainTitle.text(q.question);
    explainImage.attr("src", q.image);
    explainText.text(q.explanation);

    if (sel === q.correct) {
        yourAnswer.html("Your Answer: " + q.answers[sel] + " ✅").removeClass("text-danger").addClass("text-success");
        correctAnswer.text("");
    } else {
        yourAnswer.html("Your Answer: " + q.answers[sel] + " ❌").removeClass("text-success").addClass("text-danger");
        correctAnswer.text("Correct Answer: " + q.answers[q.correct]);
    }

    explainSection.show();
    saveState();
}

$("#nextBtn").click(() => {
    currentQuestion++;
    lastSelected = null;
    if (currentQuestion < quizData.length) {
        stage = "quiz";
        hideAll();
        showQuestion();
        quizSection.show();
    } else {
        stage = "result";
        showResults();
    }
    saveState();
});

function showResults() {
    hideAll();

    const total = quizData.length;
    const correct = score;
    const incorrect = total - correct;
    const accuracy = Math.round((correct / total) * 100);

    // Mock ranking (you can later connect to DB for real ranking)
    const rank = Math.floor(Math.random() * 5000) + 1;

    finalScore.html(`
      🏆 Congratulations!<br>
      ${correct} correct / ${incorrect} incorrect<br>
      Accuracy: ${accuracy}%<br>
      #${rank} best in the world
    `);

    // Accuracy bar
    $("#accuracyBar").html(`
  <div class="progress my-3" style="height: 25px; border-radius: 10px;">
    <div class="progress-bar bg-success" role="progressbar" style="width: ${accuracy}%">
      ${accuracy}% Correct
    </div>
    <div class="progress-bar bg-danger" role="progressbar" style="width: ${100 - accuracy}%">
      ${100 - accuracy}% Wrong
    </div>
  </div>
`);


    // Example ranking list (mock data)
    rankingList.html(`
      <li>🥇 Alice - 3/3</li>
      <li>🥈 Bob - 2/3</li>
      <li>🥉 You - ${score}/${total}</li>
    `);

    resultSection.show();
    saveState();
}


function restartQuiz() {
    localStorage.removeItem("quizState");
    currentQuestion = 0;
    score = 0;
    answers = [];
    stage = "welcome";
    lastSelected = null;
    hideAll();
    welcomeSection.show();
}

// --- Share Result (mock login requirement) ---
function shareResult() {
    const isLoggedIn = true; // <-- change later with real login
    if (!isLoggedIn) {
        window.location.href = "signin.html"; // redirect to login page
        return;
    }

    const correct = score;
    const total = quizData.length;
    const incorrect = total - correct;
    const accuracy = Math.round((correct / total) * 100);
    const wrongPercent = 100 - accuracy;

    // Random mock ranking
    const rank = Math.floor(Math.random() * 5000) + 1;

    $("#shareContent").html(`
      <p><strong>You scored:</strong> ${correct} correct / ${incorrect} incorrect</p>
      <div class="progress my-3" style="height: 25px; border-radius: 10px;">
        <div class="progress-bar bg-success" role="progressbar" style="width: ${accuracy}%">
          ${accuracy}%
        </div>
        <div class="progress-bar bg-danger" role="progressbar" style="width: ${wrongPercent}%">
          ${wrongPercent > 0 ? wrongPercent + "%" : ""}
        </div>
      </div>
      <p><strong>Ranking:</strong> #${rank} best in the world</p>
      <p>Keep playing to climb higher!</p>
    `);

    // Change Facebook share button color & function
    $(".fb-share-btn")
        .removeClass("btn-warning")
        .addClass("btn-primary")
        .off("click")
        .on("click", () => {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(`I scored ${correct}/${total} in Penang Street Food Quiz! #PenangFood`);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank");
        });

    const shareModal = new bootstrap.Modal(document.getElementById("shareModal"));
    shareModal.show();
}

