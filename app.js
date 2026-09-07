function startVoiceInput() {
  const symptomsField = document.getElementById('symptomsText');
  
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'en-IN';
  recognition.interimResults = false;

  symptomsField.placeholder = "Listening... Speak now...";

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    symptomsField.value += (symptomsField.value ? " " : "") + transcript;
    symptomsField.placeholder = "Describe your symptoms here...";
  };

  recognition.onerror = function() {
    alert("Voice input failed or timed out. Please try again.");
    symptomsField.placeholder = "Describe your symptoms here...";
  };

  recognition.start();
}

function processOCR() {
  const fileInput = document.getElementById('documentUpload');
  const statusText = document.getElementById('ocrStatus');
  const file = fileInput.files[0];

  if (!file) return;

  statusText.innerText = "⏳ Extracting text from document via OCR...";

  Tesseract.recognize(file, 'eng')
    .then(({ data: { text } }) => {
      document.getElementById('symptomsText').value += "\n\n[OCR Extracted Record]: " + text.trim();
      statusText.innerText = "✅ OCR text successfully extracted into intake sheet!";
    })
    .catch(err => {
      console.error(err);
      statusText.innerText = "❌ Could not extract text from file.";
    });
}

function processAndSubmitCase() {
  const name = document.getElementById('patientName').value;
  const age = document.getElementById('patientAge').value;
  const gender = document.getElementById('patientGender').value;
  const rawSymptoms = document.getElementById('symptomsText').value;

  if (!name || !rawSymptoms) {
    alert("Please fill in the patient details and symptoms!");
    return;
  }

  const formattedSummary = `
    <div class="summary-box">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3>📋 Clinical Summary Sheet</h3>
        <span class="badge badge-pending" id="caseStatus">Pending Doctor Review</span>
      </div>
      <hr>
      <p><strong>Patient Name:</strong> ${name}</p>
      <p><strong>Demographics:</strong> ${age} Years Old | ${gender}</p>
      <p><strong>Chief Complaints & History:</strong></p>
      <div class="symptom-box">${rawSymptoms.replace(/\n/g, '<br>')}</div>
      
      <div style="margin-top: 15px;">
        <button class="btn-approve" onclick="approveDoctorCase()">✅ Doctor Review: Verify & Approve Case</button>
      </div>
    </div>
  `;

  document.getElementById('summaryOutput').innerHTML = formattedSummary;
}

function approveDoctorCase() {
  const statusBadge = document.getElementById('caseStatus');
  if (statusBadge) {
    statusBadge.innerText = "✅ Verified & Approved by Physician";
    statusBadge.className = "badge badge-approved";
    alert("Case approved! The structured record has been finalized for clinical evaluation.");
  }
}