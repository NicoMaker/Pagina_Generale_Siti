document.addEventListener('DOMContentLoaded', function () {
    // Elementi DOM
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const translateBtn = document.getElementById('translate-btn');
    const swapBtn = document.getElementById('swap-languages');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const sourceCharCount = document.getElementById('source-char-count');
    const targetCharCount = document.getElementById('target-char-count');
    const copyBtn = document.getElementById('copy-btn');
    const speakBtn = document.getElementById('speak-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const shareBtn = document.getElementById('share-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelClearBtn = document.getElementById('cancel-clear-btn');
    const confirmClearBtn = document.getElementById('confirm-clear-btn');
    const clearSourceBtn = document.getElementById('clear-source-btn');

    // Elementi per i selettori di lingua
    const sourceLanguageDisplay = document.getElementById('source-language-display');
    const targetLanguageDisplay = document.getElementById('target-language-display');
    const sourceLanguageDropdown = document.getElementById('source-language-dropdown');
    const targetLanguageDropdown = document.getElementById('target-language-dropdown');
    const sourceLanguageList = document.getElementById('source-language-list');
    const targetLanguageList = document.getElementById('target-language-list');
    const sourceLanguageSearch = document.getElementById('source-language-search');
    const targetLanguageSearch = document.getElementById('target-language-search');
    const sourceLanguageName = document.getElementById('source-language-name');
    const targetLanguageName = document.getElementById('target-language-name');
    const sourceLanguageFlag = document.getElementById('source-language-flag');
    const targetLanguageFlag = document.getElementById('target-language-flag');
    const sourceLanguageSelector = document.getElementById('source-language-selector');
    const targetLanguageSelector = document.getElementById('target-language-selector');

    // Stato dell'applicazione
    let currentSourceLang = 'it';
    let currentTargetLang = 'en';
    let translationHistory = loadTranslationHistory();

    // Lista completa delle lingue
    const languages = [
        { code: 'af', name: 'Afrikaans', flag: 'za' },
        { code: 'sq', name: 'Albanese', flag: 'al' },
        { code: 'am', name: 'Amarico', flag: 'et' },
        { code: 'ar', name: 'Arabo', flag: 'sa' },
        { code: 'hy', name: 'Armeno', flag: 'am' },
        { code: 'az', name: 'Azero', flag: 'az' },
        { code: 'eu', name: 'Basco', flag: 'es' },
        { code: 'be', name: 'Bielorusso', flag: 'by' },
        { code: 'bn', name: 'Bengali', flag: 'bd' },
        { code: 'bs', name: 'Bosniaco', flag: 'ba' },
        { code: 'bg', name: 'Bulgaro', flag: 'bg' },
        { code: 'ca', name: 'Catalano', flag: 'es' },
        { code: 'ceb', name: 'Cebuano', flag: 'ph' },
        { code: 'ny', name: 'Chichewa', flag: 'mw' },
        { code: 'zh-CN', name: 'Cinese (Semplificato)', flag: 'cn' },
        { code: 'zh-TW', name: 'Cinese (Tradizionale)', flag: 'tw' },
        { code: 'co', name: 'Corso', flag: 'fr' },
        { code: 'hr', name: 'Croato', flag: 'hr' },
        { code: 'cs', name: 'Ceco', flag: 'cz' },
        { code: 'da', name: 'Danese', flag: 'dk' },
        { code: 'nl', name: 'Olandese', flag: 'nl' },
        { code: 'en', name: 'Inglese', flag: 'gb' },
        { code: 'eo', name: 'Esperanto', flag: 'eu' },
        { code: 'et', name: 'Estone', flag: 'ee' },
        { code: 'tl', name: 'Filippino', flag: 'ph' },
        { code: 'fi', name: 'Finlandese', flag: 'fi' },
        { code: 'fr', name: 'Francese', flag: 'fr' },
        { code: 'fy', name: 'Frisone', flag: 'nl' },
        { code: 'gl', name: 'Galiziano', flag: 'es' },
        { code: 'ka', name: 'Georgiano', flag: 'ge' },
        { code: 'de', name: 'Tedesco', flag: 'de' },
        { code: 'el', name: 'Greco', flag: 'gr' },
        { code: 'gu', name: 'Gujarati', flag: 'in' },
        { code: 'ht', name: 'Creolo haitiano', flag: 'ht' },
        { code: 'ha', name: 'Hausa', flag: 'ng' },
        { code: 'haw', name: 'Hawaiano', flag: 'us' },
        { code: 'iw', name: 'Ebraico', flag: 'il' },
        { code: 'hi', name: 'Hindi', flag: 'in' },
        { code: 'hmn', name: 'Hmong', flag: 'cn' },
        { code: 'hu', name: 'Ungherese', flag: 'hu' },
        { code: 'is', name: 'Islandese', flag: 'is' },
        { code: 'ig', name: 'Igbo', flag: 'ng' },
        { code: 'id', name: 'Indonesiano', flag: 'id' },
        { code: 'ga', name: 'Irlandese', flag: 'ie' },
        { code: 'it', name: 'Italiano', flag: 'it' },
        { code: 'ja', name: 'Giapponese', flag: 'jp' },
        { code: 'jw', name: 'Giavanese', flag: 'id' },
        { code: 'kn', name: 'Kannada', flag: 'in' },
        { code: 'kk', name: 'Kazako', flag: 'kz' },
        { code: 'km', name: 'Khmer', flag: 'kh' },
        { code: 'rw', name: 'Kinyarwanda', flag: 'rw' },
        { code: 'ko', name: 'Coreano', flag: 'kr' },
        { code: 'ku', name: 'Curdo', flag: 'iq' },
        { code: 'ky', name: 'Kirghiso', flag: 'kg' },
        { code: 'lo', name: 'Lao', flag: 'la' },
        { code: 'la', name: 'Latino', flag: 'va' },
        { code: 'lv', name: 'Lettone', flag: 'lv' },
        { code: 'lt', name: 'Lituano', flag: 'lt' },
        { code: 'lb', name: 'Lussemburghese', flag: 'lu' },
        { code: 'mk', name: 'Macedone', flag: 'mk' },
        { code: 'mg', name: 'Malgascio', flag: 'mg' },
        { code: 'ms', name: 'Malese', flag: 'my' },
        { code: 'ml', name: 'Malayalam', flag: 'in' },
        { code: 'mt', name: 'Maltese', flag: 'mt' },
        { code: 'mi', name: 'Maori', flag: 'nz' },
        { code: 'mr', name: 'Marathi', flag: 'in' },
        { code: 'mn', name: 'Mongolo', flag: 'mn' },
        { code: 'my', name: 'Birmano', flag: 'mm' },
        { code: 'ne', name: 'Nepalese', flag: 'np' },
        { code: 'no', name: 'Norvegese', flag: 'no' },
        { code: 'or', name: 'Odia', flag: 'in' },
        { code: 'ps', name: 'Pashto', flag: 'af' },
        { code: 'fa', name: 'Persiano', flag: 'ir' },
        { code: 'pl', name: 'Polacco', flag: 'pl' },
        { code: 'pt', name: 'Portoghese', flag: 'pt' },
        { code: 'pa', name: 'Punjabi', flag: 'in' },
        { code: 'ro', name: 'Rumeno', flag: 'ro' },
        { code: 'ru', name: 'Russo', flag: 'ru' },
        { code: 'sm', name: 'Samoano', flag: 'ws' },
        { code: 'gd', name: 'Gaelico scozzese', flag: 'gb' },
        { code: 'sr', name: 'Serbo', flag: 'rs' },
        { code: 'st', name: 'Sesotho', flag: 'ls' },
        { code: 'sn', name: 'Shona', flag: 'zw' },
        { code: 'sd', name: 'Sindhi', flag: 'pk' },
        { code: 'si', name: 'Singalese', flag: 'lk' },
        { code: 'sk', name: 'Slovacco', flag: 'sk' },
        { code: 'sl', name: 'Sloveno', flag: 'si' },
        { code: 'so', name: 'Somalo', flag: 'so' },
        { code: 'es', name: 'Spagnolo', flag: 'es' },
        { code: 'su', name: 'Sundanese', flag: 'id' },
        { code: 'sw', name: 'Swahili', flag: 'tz' },
        { code: 'sv', name: 'Svedese', flag: 'se' },
        { code: 'tg', name: 'Tagiko', flag: 'tj' },
        { code: 'ta', name: 'Tamil', flag: 'in' },
        { code: 'tt', name: 'Tataro', flag: 'ru' },
        { code: 'te', name: 'Telugu', flag: 'in' },
        { code: 'th', name: 'Thailandese', flag: 'th' },
        { code: 'tr', name: 'Turco', flag: 'tr' },
        { code: 'tk', name: 'Turkmeno', flag: 'tm' },
        { code: 'uk', name: 'Ucraino', flag: 'ua' },
        { code: 'ur', name: 'Urdu', flag: 'pk' },
        { code: 'ug', name: 'Uiguro', flag: 'cn' },
        { code: 'uz', name: 'Uzbeko', flag: 'uz' },
        { code: 'vi', name: 'Vietnamita', flag: 'vn' },
        { code: 'cy', name: 'Gallese', flag: 'gb-wls' },
        { code: 'xh', name: 'Xhosa', flag: 'za' },
        { code: 'yi', name: 'Yiddish', flag: 'il' },
        { code: 'yo', name: 'Yoruba', flag: 'ng' },
        { code: 'zu', name: 'Zulu', flag: 'za' },
        { code: 'auto', name: 'Rileva lingua', flag: 'un' }
    ];

    // Funzione per popolare le liste di lingue
    function populateLanguageList(listElement, searchInput, isSource = true) {
        // Pulisci la lista
        listElement.innerHTML = '';

        // Ottieni il termine di ricerca
        const searchTerm = searchInput.value.toLowerCase();

        // Filtra le lingue in base al termine di ricerca
        const filteredLanguages = languages.filter(lang =>
            lang.name.toLowerCase().includes(searchTerm) ||
            lang.code.toLowerCase().includes(searchTerm)
        );

        // Ordina le lingue: prima quelle che iniziano con il termine di ricerca, poi le altre
        filteredLanguages.sort((a, b) => {
            const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
            const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.name.localeCompare(b.name);
        });

        // Sposta "Rileva lingua" in cima per il selettore di origine
        if (isSource) {
            const autoDetectIndex = filteredLanguages.findIndex(lang => lang.code === 'auto');
            if (autoDetectIndex !== -1) {
                const autoDetect = filteredLanguages.splice(autoDetectIndex, 1)[0];
                filteredLanguages.unshift(autoDetect);
            }
        } else {
            // Rimuovi "Rileva lingua" dal selettore di destinazione
            const autoDetectIndex = filteredLanguages.findIndex(lang => lang.code === 'auto');
            if (autoDetectIndex !== -1) {
                filteredLanguages.splice(autoDetectIndex, 1);
            }
        }

        // Aggiungi le lingue filtrate alla lista
        filteredLanguages.forEach(lang => {
            const option = document.createElement('div');
            option.className = 'language-option';
            option.dataset.code = lang.code;

            // Aggiungi la classe 'selected' se questa è la lingua corrente
            if ((isSource && lang.code === currentSourceLang) ||
                (!isSource && lang.code === currentTargetLang)) {
                option.classList.add('selected');
            }

            option.innerHTML = `
                <img src="https://flagcdn.com/w20/${lang.flag}.png" alt="${lang.name}">
                <span class="language-name">${lang.name}</span>
                <span class="language-code">${lang.code}</span>
            `;

            // Aggiungi l'evento click
            option.addEventListener('click', () => {
                if (isSource) {
                    setSourceLanguage(lang);
                } else {
                    setTargetLanguage(lang);
                }
                // Chiudi il dropdown
                if (isSource) {
                    sourceLanguageDropdown.style.display = 'none';
                } else {
                    targetLanguageDropdown.style.display = 'none';
                }
            });

            listElement.appendChild(option);
        });
    }

    // Funzione per impostare la lingua di origine
    function setSourceLanguage(lang) {
        currentSourceLang = lang.code;
        sourceLanguageName.textContent = lang.name;
        sourceLanguageFlag.src = `https://flagcdn.com/w20/${lang.flag}.png`;
        sourceLanguageFlag.alt = lang.name;
    }

    // Funzione per impostare la lingua di destinazione
    function setTargetLanguage(lang) {
        currentTargetLang = lang.code;
        targetLanguageName.textContent = lang.name;
        targetLanguageFlag.src = `https://flagcdn.com/w20/${lang.flag}.png`;
        targetLanguageFlag.alt = lang.name;
    }

    // Funzione per tradurre il testo
    async function translateText() {
        const text = sourceText.value.trim();
        if (!text) return;

        if (text.length > 5000) {
            showNotification('Il testo supera il limite di 5000 caratteri.', true);
            return;
        }

        // Mostra il caricamento
        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        targetText.value = '';

        try {
            // Utilizziamo l'API gratuita di MyMemory per la traduzione
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${currentSourceLang === 'auto' ? 'auto' : currentSourceLang}|${currentTargetLang}`
            );

            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData) {
                targetText.value = data.responseData.translatedText;
                updateCharCount(targetText, targetCharCount);

                // Se la lingua di origine era 'auto', aggiorna il selettore con la lingua rilevata
                if (currentSourceLang === 'auto' && data.responseData.detectedLanguage) {
                    const detectedCode = data.responseData.detectedLanguage.language;
                    const detectedLang = languages.find(lang => lang.code === detectedCode);

                    if (detectedLang) {
                        showNotification(`Lingua rilevata: ${detectedLang.name}`);
                    }
                }

                // Aggiungi alla cronologia
                addToHistory(text, targetText.value);
            } else {
                throw new Error('Errore nella traduzione');
            }
        } catch (error) {
            console.error('Errore di traduzione:', error);
            errorMessage.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    }

    // Funzione per scambiare le lingue
    function swapLanguages() {
        // Non scambiare se la lingua di origine è 'auto'
        if (currentSourceLang === 'auto') {
            showNotification('Non è possibile scambiare quando la lingua di origine è "Rileva lingua"');
            return;
        }

        // Trova le lingue correnti
        const sourceLang = languages.find(lang => lang.code === currentSourceLang);
        const targetLang = languages.find(lang => lang.code === currentTargetLang);

        // Scambia le lingue
        if (sourceLang && targetLang) {
            setSourceLanguage(targetLang);
            setTargetLanguage(sourceLang);
            currentSourceLang = targetLang.code;
            currentTargetLang = sourceLang.code;
        }

        // Scambia i testi
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        // Aggiorna il conteggio dei caratteri
        updateCharCount(sourceText, sourceCharCount);
        updateCharCount(targetText, targetCharCount);
    }

    // Funzione per copiare il testo tradotto
    function copyTranslatedText() {
        const text = targetText.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            showNotification('Testo copiato negli appunti!');
        });
    }

    // Funzione per leggere il testo tradotto
    function speakTranslatedText() {
        const text = targetText.value;
        if (!text) return;

        // Ferma qualsiasi sintesi vocale in corso
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentTargetLang;

            window.speechSynthesis.speak(utterance);
            showNotification('Riproduzione audio...');
        } else {
            showNotification('La sintesi vocale non è supportata dal tuo browser', true);
        }
    }

    // Funzione per attivare/disattivare la modalità a schermo intero
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showNotification(`Errore nella modalità a schermo intero: ${err.message}`, true);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Funzione per condividere la traduzione
    function shareTranslation() {
        const text = targetText.value;
        if (!text) return;

        if (navigator.share) {
            navigator.share({
                title: 'Traduzione',
                text: text
            }).catch(err => {
                showNotification('Errore durante la condivisione', true);
            });
        } else {
            copyTranslatedText();
            showNotification('Testo copiato negli appunti!');
        }
    }

    // Funzione per cambiare il tema
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');

        // Aggiorna l'icona del tema
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = `
                <svg class="theme-icon" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
            `;
        } else {
            themeToggle.innerHTML = `
                <svg class="theme-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
            `;
        }

        // Salva la preferenza nel localStorage
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Funzione per aggiornare il conteggio dei caratteri
    function updateCharCount(textarea, countElement) {
        if (!textarea || !countElement) return;

        const count = textarea.value.length;
        const maxCount = 5000;
        countElement.textContent = `${count}/${maxCount} caratteri`;

        if (count > 4500) {
            countElement.style.color = 'var(--secondary)';
        } else {
            countElement.style.color = 'var(--text-light)';
        }
    }

    // Funzione per mostrare una notifica
    function showNotification(message, isError = false) {
        notificationText.textContent = message;
        notification.style.backgroundColor = isError ? 'var(--secondary)' : 'var(--primary)';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Funzione per aggiungere una traduzione alla cronologia
    function addToHistory(sourceText, targetText) {
        const sourceLang = languages.find(lang => lang.code === currentSourceLang);
        const targetLang = languages.find(lang => lang.code === currentTargetLang);

        if (!sourceLang || !targetLang) return;

        const historyItem = {
            id: Date.now(),
            sourceText: sourceText,
            targetText: targetText,
            sourceLang: sourceLang.code === 'auto' ? 'auto' : sourceLang.name,
            targetLang: targetLang.name,
            timestamp: new Date().toISOString()
        };

        translationHistory.unshift(historyItem);

        // Limita la cronologia a 10 elementi
        if (translationHistory.length > 10) {
            translationHistory.pop();
        }

        // Salva la cronologia nel localStorage
        saveTranslationHistory();

        // Aggiorna la visualizzazione della cronologia
        updateHistoryDisplay();
    }

    // Funzione per salvare la cronologia nel localStorage
    function saveTranslationHistory() {
        localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    }

    // Funzione per caricare la cronologia dal localStorage
    function loadTranslationHistory() {
        const history = localStorage.getItem('translationHistory');
        return history ? JSON.parse(history) : [];
    }

    // Funzione per cancellare la cronologia
    function clearHistory() {
        translationHistory = [];
        saveTranslationHistory();
        updateHistoryDisplay();
        showNotification('Cronologia cancellata con successo');
    }

    // Funzione per mostrare il modal di conferma
    function showConfirmModal() {
        confirmModal.classList.add('show');
    }

    // Funzione per nascondere il modal di conferma
    function hideConfirmModal() {
        confirmModal.classList.remove('show');
    }

    // Funzione per pulire il campo di testo sorgente
    function clearSourceText() {
        sourceText.value = '';
        updateCharCount(sourceText, sourceCharCount);
    }

    // Funzione per aggiornare la visualizzazione della cronologia
    function updateHistoryDisplay() {
        historyList.innerHTML = '';

        if (translationHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Nessuna traduzione recente</div>';
            return;
        }

        translationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const date = new Date(item.timestamp);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-languages">${item.sourceLang} → ${item.targetLang}</span>
                    <span class="history-time">${formattedDate}</span>
                </div>
                <div class="history-text">${item.sourceText}</div>
            `;

            historyItem.addEventListener('click', () => {
                sourceText.value = item.sourceText;
                targetText.value = item.targetText;
                updateCharCount(sourceText, sourceCharCount);
                updateCharCount(targetText, targetCharCount);
            });

            historyList.appendChild(historyItem);
        });
    }

    // Inizializza i selettori di lingua
    populateLanguageList(sourceLanguageList, sourceLanguageSearch);
    populateLanguageList(targetLanguageList, targetLanguageSearch, false);

    // Imposta la lingua di origine in base alla lingua del browser
    const browserLang = navigator.language.split('-')[0];
    const matchedLang = languages.find(lang => lang.code === browserLang);
    if (matchedLang) {
        setSourceLanguage(matchedLang);
        currentSourceLang = matchedLang.code;

        // Se la lingua del browser è la stessa della lingua target, imposta la lingua target a inglese
        if (currentTargetLang === browserLang) {
            const englishLang = languages.find(lang => lang.code === 'en');
            if (englishLang) {
                setTargetLanguage(englishLang);
                currentTargetLang = 'en';
            }
        }
    }

    // Carica la preferenza del tema dal localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = `
            <svg class="theme-icon" viewBox="0 0 24 24">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/>
            </svg>
        `;
    }

    // Imposta la preferenza del tema in base all'ora del giorno se non è già impostata
    if (!localStorage.getItem('darkMode')) {
        const hours = new Date().getHours();
        if (hours >= 19 || hours < 7) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
            themeToggle.innerHTML = `
                <svg class="theme-icon" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
            `;
        }
    }

    // Aggiorna la visualizzazione della cronologia
    updateHistoryDisplay();

    // Eventi per i dropdown delle lingue
    sourceLanguageDisplay.addEventListener('click', () => {
        sourceLanguageDropdown.style.display = sourceLanguageDropdown.style.display === 'block' ? 'none' : 'block';
        targetLanguageDropdown.style.display = 'none';
    });

    targetLanguageDisplay.addEventListener('click', () => {
        targetLanguageDropdown.style.display = targetLanguageDropdown.style.display === 'block' ? 'none' : 'block';
        sourceLanguageDropdown.style.display = 'none';
    });

    // Chiudi i dropdown quando si fa clic altrove
    document.addEventListener('click', (e) => {
        if (!sourceLanguageSelector.contains(e.target)) {
            sourceLanguageDropdown.style.display = 'none';
        }
        if (!targetLanguageSelector.contains(e.target)) {
            targetLanguageDropdown.style.display = 'none';
        }
    });

    // Eventi per la ricerca delle lingue
    sourceLanguageSearch.addEventListener('input', () => {
        populateLanguageList(sourceLanguageList, sourceLanguageSearch);
    });

    targetLanguageSearch.addEventListener('input', () => {
        populateLanguageList(targetLanguageList, targetLanguageSearch, false);
    });

    // Event listeners
    translateBtn.addEventListener('click', translateText);
    swapBtn.addEventListener('click', swapLanguages);
    copyBtn.addEventListener('click', copyTranslatedText);
    speakBtn.addEventListener('click', speakTranslatedText);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    shareBtn.addEventListener('click', shareTranslation);
    themeToggle.addEventListener('click', toggleTheme);
    clearHistoryBtn.addEventListener('click', showConfirmModal);
    cancelClearBtn.addEventListener('click', hideConfirmModal);
    confirmClearBtn.addEventListener('click', () => {
        clearHistory();
        hideConfirmModal();
    });
    clearSourceBtn.addEventListener('click', clearSourceText);

    // Traduzione automatica quando si preme Invio nel campo di testo
    sourceText.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            translateText();
        }
    });

    // Traduzione automatica dopo una pausa nella digitazione
    let typingTimer;
    sourceText.addEventListener('input', function () {
        clearTimeout(typingTimer);
        if (sourceText.value) {
            typingTimer = setTimeout(translateText, 1500);
        }
        updateCharCount(sourceText, sourceCharCount);
    });

    // Inizializza il conteggio dei caratteri
    updateCharCount(sourceText, sourceCharCount);
    updateCharCount(targetText, targetCharCount);
});