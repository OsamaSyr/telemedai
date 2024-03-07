document.getElementById('process-file-btn').addEventListener('click', function() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mp3, .wav';

    fileInput.onchange = async function(event) {
        let file = event.target.files[0];
        if (file) {
            document.getElementById('loading').style.display = 'block';
            let formData = new FormData();
            formData.append('file', file);
            formData.append('model', 'whisper-1');
            try {
                let transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer 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'
                    },
                    body: formData
                });
                if (transcriptionResponse.ok) {
                    let transcriptionData = await transcriptionResponse.json();
                    let transcription = transcriptionData['text'];
                    await processWithGPT4(transcription);
                } else {
                    // Handle transcription error
                    console.error('Transcription error', transcriptionResponse);
                    document.getElementById('loading').style.display = 'none';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('loading').style.display = 'none';
            }
        }
    };

    fileInput.click();
});

async function processWithGPT4(transcription) {
    let requestBody = JSON.stringify({
        'model': 'gpt-3.5-turbo',
        'messages': [
            {'role': 'system', 'content': 'please provide a summary...'},
            {'role': 'user', 'content': transcription},
        ],
    });

    try {
        let summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: requestBody
        });

        if (summaryResponse.ok) {
            let summaryData = await summaryResponse.json();
            let summary = summaryData['choices'][0]['message']['content'];
            displaySummary(summary);
        } else {
            // Handle summary error
            console.error('Summary error', summaryResponse);
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
    }
}

function displaySummary(summary) {
    let summaryContainer = document.getElementById('summary-container');
    let loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'none';
    summaryContainer.innerHTML = '';
    if (summary) {
        let summaryPoints = summary.split('- ');
        summaryPoints.forEach(point => {
            if (point.trim()) {
                let para = document.createElement('p');
                para.textContent = point.trim();
                summaryContainer.appendChild(para);
            }
        });
    } else {
        summaryContainer.textContent = 'No summary available. Please process an audio file.';
    }
}
