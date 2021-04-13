let data; // переменная, в которую сохраняется массив в заданиями
let param; // переменная, в которую сохраняются параметры упражнения
let currentTask; // переменная, в которую сохраняется текущее задание
let answered = false;   // true - на задание дан ответ, кнопки не работают, кнопка "Продолжить"
                        // false - на задание не дан ответ, кнопки работают, кнопка "Не знаю"
let variants; // варианты в неперемешенном виде

/* элементы */
const TASK_TEXT = document.querySelector('#tasktext');
const TASK_HELP = document.querySelector('#taskhelp');
const TASK_BUTTONSLIST = document.querySelector('#taskbuttons');
const TASK_IDK = document.querySelector('.dontknowbtn');
const TASK_SOURCE = document.querySelector('#tasksource');
const TASK_WHY = document.querySelector('.whybtn');

const HEADER_H1 = document.querySelector('header h1');

/* Получение массива */
function getData(link) {
    fetch(link)
        .then(response => response.json())
        .then(commits => {
            data = commits.data;
            param = commits.param;
            document.title = param.title /*+ ' — Русский язык'*/;

            console.log(data.length);

            /* help */
            document.querySelector('#helpdesc').innerText = param.desc;

            TASK_WHY.style.display = 'none';

            if (param.fontsize == 'small') {
                TASK_TEXT.classList.add('small');
            }

            /* генерация задания при запуске */
            generateTask();
        });
}

// get url
let urlData = window.location.search.replace('?','');

//urlData = urlData.replace(/\&/gmi, '","');
//urlData = urlData.replace(/\=/gmi, '":"');

urlData = (urlData.replace(/\&/gmi, '","')).replace(/\=/gmi, '":"');
urlData = '{"' + urlData + '"}';

urlData = JSON.parse(urlData);

//console.log(urlData);

getData('/data/task/' + urlData.task + '.json');

/* Генерация задания */
function generateTask() {

    // Сбрасывает элементы
    TASK_TEXT.innerHTML = '';
    TASK_BUTTONSLIST.innerHTML = '';
    TASK_IDK.innerHTML = 'Не знаю';
    answered = false;
    TASK_SOURCE.innerText = '';
    HEADER_H1.innerText = param.title2;
    TASK_WHY.style.display = 'none';
    
    // Выбирает случайное задание
    currentTask = data[Math.floor(Math.random() * data.length)];
    if (typeof currentTask.vars == 'string') {
        currentTask.vars = Array(currentTask.vars);
    }
    variants = currentTask.vars;
    
    // Источник
    function returnSource() {
        switch (currentTask.source) {
            case 'osfipi':
                return '<a href="http://os.fipi.ru/" target="_blank">os.fipi.ru</a>';
            default:
                return currentTask.source;
        }
    }
    if (currentTask.source) {
        TASK_SOURCE.innerHTML = 'Источник: ' + returnSource();
    }
    else {
        TASK_SOURCE.innerText = '';
    }

    if (param.randomize) {
        for (let i = currentTask.vars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentTask.vars[i], currentTask.vars[j]] = [currentTask.vars[j], currentTask.vars[i]];
        }
    }
    
    // Изменяет элементы
    TASK_TEXT.innerHTML = currentTask.text.replace('_', '________')/*.replace('/', '_')*/;
    /*TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/<op>/gmi, '<option>');
    TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/<\/op>/gmi, '</option>');
    TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/<se>/gmi, '<select>');
    TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/<\/se>/gmi, '</select>');*/

    // Условие задания - замена
    if (param.replace?.r1) { TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/\[1\]/gmi, param.replace.r1) }
    if (param.replace?.r2) { TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/\[1\]/gmi, param.replace.r2) }
    if (param.replace?.r3) { TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/\[1\]/gmi, param.replace.r3) }
    if (param.replace?.r4) { TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace(/\[1\]/gmi, param.replace.r4) }
    
    switch (param.type) {
        case 'input':
            // Вариант 'input': генерация поля ввода
            if (!param.customhint) {
                TASK_HELP.innerText = 'Введите ответ';
            }
            TASK_BUTTONSLIST.innerHTML = '<input id="taskinput"><button id="confirmbtn" class="taskbtn" onclick="checkInput()">Сохранить</button>';
            break;
        case 'select':
            // Вариант 'select': генерация кнопки проверки
            if (!param.customhint) {
                TASK_HELP.innerText = 'Выберите правильные варианты в выпадающих списках';
            }
            TASK_BUTTONSLIST.innerHTML = '<button id="confirmbtn" class="taskbtn" onclick="checkSelect()">Сохранить</button>';
            break;
        default:
            // Вариант 'choose': генерация кнопок
            if (!param.customhint) {
                TASK_HELP.innerText = 'Выберите правильный ответ';
            }
            for (let i of currentTask.vars) {
                TASK_BUTTONSLIST.innerHTML += '<button id="answerbtn" class="taskbtn">' + i + '</button>';
            }
            for (let j of document.querySelectorAll('#answerbtn')) {
                j.addEventListener('click', () => {
                    checkAnswer(j.innerText);
                });
            }
            break;
    }

    // Если присутствует кастомная подсказка, то происходит вот это
    if (param.customhint) {
        let customhint = param.customhint;
        TASK_HELP.innerHTML = customhint.replace('{1}', '<span style="font-weight: 800;">' + currentTask.ch + '</span>');
    }

}

/* Проверка задания (тип choose) */
function checkAnswer(val) {
    if (!answered) {
        checkMain();

        TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace('________', '<span style="color: var(--theme-color-gray);">' + currentTask.vars[currentTask.cor] + '</span>');
        
        if (val == variants[currentTask.cor]) {
            TASK_HELP.innerHTML = '<span style="color: #70ad47;">Правильно</span>';

        }
        else {
            TASK_HELP.innerHTML = '<span style="color: #ed7d31;">Неправильно</span>';

            // Выделяет неправильный ответ
            for (let i of document.querySelectorAll('#answerbtn')) {
                if ((i.innerText == val) && (val != variants[currentTask.cor])) {
                    i.classList = 'taskbtn wrong';
                }
            }
        }
    }

    // Выделяет правильный ответ
    for (let i of document.querySelectorAll('#answerbtn')) {
        if (i.innerText == variants[currentTask.cor]) {
            i.classList = 'taskbtn correct';
        }
    }
}

/* Проверка задания (тип input) */
function checkInput() {
    if (!answered) {
        checkMain();
        document.querySelector('#confirmbtn').remove();

        document.querySelector('#taskinput').setAttribute('readonly', true);
        if (document.querySelector('#taskinput').value.toLowerCase() == currentTask.vars[0].toLowerCase()) {
            TASK_HELP.innerHTML = '<span style="color: #70ad47;">Правильно</span>';
        }
        else {
            TASK_HELP.innerHTML = '<span style="color: #ed7d31;">Неправильно.</span><br/><span style="color: var(--theme-color-gray);font-size: 90%;">Правильный ответ: ' + currentTask.vars[0] + '</span>';
        }
    }
}

/* Проверка задания (для select) */

function checkSelect() {
    let selects = document.querySelectorAll('#tasktext select');
    if (!answered) {
        checkMain();
        document.querySelector('#confirmbtn').remove();

        let corSelects = 0;
        let selectsIndex = 0;

        for (let i of selects) {
            i.setAttribute('disabled', true);

            if (i.value == variants[selectsIndex]) {
                i.classList.add('correct');
                corSelects++;
            }
            else {
                i.classList.add('wrong');
            }
            selectsIndex++;
        }

        TASK_HELP.innerHTML = 'Правильно ' + corSelects + ' из ' + selects.length;
    }
}

// функция, которая должна находиться во всех функциях проверки
function checkMain() {
    answered = true;
    TASK_IDK.innerText = 'Продолжить';
    TASK_IDK.focus();
    if (currentTask.why) {
        TASK_WHY.style.display = '';
    }
}

/* Кнопка "Не знаю/Продолжить" */
function idkAnswer() {
    if (!answered) {
        checkMain()

        switch (param.type) {
            case 'input':
                let inputs = document.querySelector('#taskinput');
                inputs.setAttribute('disabled', true);
                inputs.value = currentTask.vars[0];
                break;
            case 'select':
                let selects = document.querySelectorAll('#tasktext select');
                let selectsIndex = 0;

                for (let i of selects) {
                    i.setAttribute('disabled', true);
                    i.value = variants[selectsIndex];
                    selectsIndex++;
                }
                break;
        }
    }
    else {
        generateTask();
        if (param.type == 'input') {
            document.querySelector('#taskinput').focus();
        }
    }
}