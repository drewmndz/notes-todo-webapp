const userName = document.querySelector('.user')
const editUserBtn = document.querySelector('.edit')
userName.innerText = localStorage.getItem('userName') ? localStorage.getItem('userName') : 'User'

const navItems = document.querySelectorAll('.nav-item')
const sectionContainer = document.querySelector('.section-container')

const defaultContent = document.querySelectorAll('.default-content')

// notes section variables
const notesContainer = document.querySelector('.notes-container')
const addNoteBtn = document.querySelector('.add-note-button')
const notesInput = document.querySelector('.notes-input')
const cancelBtn = document.querySelector('.cancel')
const saveBtn = document.querySelector('.save')
const titleInput = document.querySelector('.title-input')
const noteContentInput = document.querySelector('.note-content-input')
const closeContainer = document.querySelector('.x-container')
const closeBtn = document.querySelector('.close')
const deleteBtn = document.querySelector('.delete')
const dateContainer = document.querySelector('.time')
const noteEntries = localStorage.getItem('noteEntries') ? JSON.parse(localStorage.getItem('noteEntries')) : []
const previewIndex = {index: 0}

// to edit the user's name
editUserBtn.addEventListener('click', () => {
    userName.setAttribute('contenteditable', 'true')
    userName.focus()
    document.getSelection().modify("move", "forward", "lineboundary") // to set the cursor/caret at the of a contenteditable element
})

userName.addEventListener('focusout', () => {
    userName.setAttribute('contenteditable', 'false')
    localStorage.setItem('userName', userName.innerText)
})

userName.addEventListener('keypress', event => {
    if(event.key === 'Enter') {
        userName.blur()
    }
})


// check on what section the user is currently in
sectionContainer.addEventListener('scroll', event => {
    const SCROLL_TO_SWITCH = 203
    const scrolled = event.target.scrollLeft

    if(scrolled >= SCROLL_TO_SWITCH) {
        navItems[0].classList.remove('current')
        navItems[1].classList.add('current')
    } else {
        navItems[0].classList.add('current')
        navItems[1].classList.remove('current')
    }
})


// NOTES SECTION FUNCTIONS
function openNotesInput() {
    closeContainer.style.display = 'none'
    deleteBtn.classList.add('display-none')
    cancelBtn.classList.remove('display-none')
    notesInput.classList.add('open')
    noteContentInput.focus()
}

function openNotesPreview() {
    closeContainer.style.display = 'flex'
    deleteBtn.classList.remove('display-none')
    cancelBtn.classList.add('display-none')
    notesInput.classList.add('open')
    noteContentInput.focus()
}

function closeNotesInput() {
    notesInput.classList.remove('open')
    disableSaveBtn()
    saveBtn.classList.remove('save-edit')
}

function resetNotesInput() {
    titleInput.value = ''
    noteContentInput.value = ''
}

function refreshNotesContainer() {
    notesContainer.replaceChildren(notesContainer.firstElementChild)
}

function disableSaveBtn() {
    saveBtn.classList.add('disabled')
    saveBtn.removeEventListener('click', addNote)
}

function enableSaveBtn() {
    saveBtn.classList.remove('disabled')
    saveBtn.addEventListener('click', addNote)
}

function getElementIndex(element) {
    return [...element.parentNode.children].indexOf(element) - 1
}

function previewNote(index) {
    titleInput.value = noteEntries[index].title
    noteContentInput.value = noteEntries[index].note
}

function formatDate() {
    const date = new Date()
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const hour = date.getHours() % 12 || 12;
    const minute = date.getMinutes()
    const isAm = date.getHours() < 12;
    
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${isAm ? 'AM' : 'PM'}`
}   

function displayNote() {
    let title = ''
    let note = ''
    let time = ''

    if(noteEntries.length !== 0) {
        defaultContent[0].classList.add('has-content')
    } else {
        defaultContent[0].classList.remove('has-content')
    }

    refreshNotesContainer()

    noteEntries.forEach(noteEntry => {
        title = noteEntry.title
        note = noteEntry.note
        time = noteEntry.time

        const noteContainer = document.createElement('div')
        noteContainer.classList.add('note-container')

        const titleContainer = document.createElement('p')
        titleContainer.classList.add('title')
        titleContainer.innerText = title

        const noteContentContainer = document.createElement('p')
        noteContentContainer.classList.add('note-content')
        noteContentContainer.innerText = note

        const timeContainer = document.createElement('p')
        timeContainer.classList.add('time')
        timeContainer.innerText = time

        noteContainer.append(titleContainer, noteContentContainer, timeContainer)
        notesContainer.append(noteContainer)
    })
}

function addNote() {
    let noteTitle = titleInput.value ? titleInput.value : 'Untitled'
    let noteContent = noteContentInput.value
    let time = formatDate()

    const noteEntry = {
        title: noteTitle,
        note: noteContent,
        time: time
    }

    if(saveBtn.classList.contains('save-edit')) {
        let isSameTitle = noteTitle === noteEntries[previewIndex.index].title
        let isSameNote = noteContent === noteEntries[previewIndex.index].note

        if(!isSameTitle || !isSameNote) {
            noteEntries.splice(previewIndex.index, 1)
            noteEntries.unshift(noteEntry)
            localStorage.setItem('noteEntries', JSON.stringify(noteEntries))
            notesContainer.scrollTo(0, 0)
        }
    } else {
        noteEntries.unshift(noteEntry)
        localStorage.setItem('noteEntries', JSON.stringify(noteEntries))
        notesContainer.scrollTo(0, 0)
    }
    
    closeNotesInput()
    resetNotesInput()
    disableSaveBtn()
    displayNote()
    
}

function deleteNote(index) {
    noteEntries.splice(index, 1)
    localStorage.setItem('noteEntries', JSON.stringify(noteEntries))
    closeNotesInput()
    displayNote()    
}



addNoteBtn.addEventListener('click', () => {
    resetNotesInput()
    openNotesInput()
})

cancelBtn.addEventListener('click', closeNotesInput)

closeBtn.addEventListener('click', closeNotesInput)

noteContentInput.addEventListener('input', () => {
    if(noteContentInput.value.trim()) {
        enableSaveBtn()
    } else {
        disableSaveBtn()
    }
})

notesContainer.addEventListener('click', event => {
    const target = event.target
    const targetChild = target.parentElement.classList.contains('note-container')
    const targetParent = target.classList.contains('note-container')
    
    if(targetChild || targetParent) {
        openNotesPreview()
        enableSaveBtn()
        saveBtn.classList.add('save-edit')

        let index = 0

        if(targetChild) {
            index = getElementIndex(target.parentElement)
            
        } else if(targetParent) {
            index = getElementIndex(target)
        }

        previewIndex.index = index

        previewNote(index)
    }
})

deleteBtn.addEventListener('click', () => {
    deleteNote(previewIndex.index)
    saveBtn.classList.remove('save-edit')
})

// onload
displayNote()