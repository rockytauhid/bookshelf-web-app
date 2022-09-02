const books = [];
const searchBooks = [];
const SEARCH_EVENT = 'search-book';
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const inputBookForm = document.getElementById('inputBook');

    const bookUnReadSubmitButton = document.getElementById('bookUnReadSubmit');
    bookUnReadSubmitButton.addEventListener('click', function () {
        addBook(false);
        inputBookForm.reset();
    });

    const bookReadSubmitButton = document.getElementById('bookReadSubmit');
    bookReadSubmitButton.addEventListener('click', function () {
        addBook(true);
        inputBookForm.reset();
    });

    const searchSubmitForm = document.getElementById('searchBook');
    searchSubmitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook(true);
        searchSubmitForm.reset();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SEARCH_EVENT, function () {
    const searchBookshelfList = document.getElementById('searchBookshelfList');
    searchBookshelfList.innerHTML = '';

    const searchResultStatus = document.createElement('h3');

    if (searchBooks.length > 0) {
        searchResultStatus.innerText = `${searchBooks.length} buku ditemukan.`;
        searchBookshelfList.append(searchResultStatus);

        for (const bookItem of searchBooks) {
            const bookTitleLink = document.createElement('a');
            bookTitleLink.href = `#book-${bookItem.id}`;
            bookTitleLink.innerText = `${bookItem.author} (${bookItem.year}). ${bookItem.title}.`;
            searchBookshelfList.append(bookTitleLink);
        }
    } else {
        searchResultStatus.innerText = 'Buku tidak ditemukan.';
        searchBookshelfList.append(searchResultStatus);
        setTimeout(() => {
            searchBookshelfList.innerHTML = '';
          }, 3000);
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            incompleteBookshelfList.append(bookElement);
        else
            completeBookshelfList.append(bookElement);
    }
});

document.addEventListener(SAVED_EVENT, function () {
    alert('Berhasil!');
});

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
    const bookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    alert(bookTitle);
    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().indexOf(bookTitle) != 0) {
            searchBooks.push(bookItem);
        }
    }

    document.dispatchEvent(new Event(SEARCH_EVENT));
}

function addBook(isCompleted) {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;

    const bookObject = generateBookObject(generateId(), bookTitle, bookAuthor, bookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;

    const readButton = document.createElement('button');
    readButton.classList.add('green');

    if (bookObject.isCompleted)
        readButton.innerText = 'Belum selesai di Baca';
    else
        readButton.innerText = 'Selesai dibaca';

    readButton.addEventListener('click', function () {
        moveBetweenBookshelfList(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';

    deleteButton.addEventListener('click', function () {
        deleteFromBookshelfList(bookObject.id);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');
    buttonContainer.append(readButton, deleteButton);

    const article = document.createElement('article');
    article.classList.add('book_item');
    article.append(textTitle, textAuthor, textYear, buttonContainer);
    article.setAttribute('id', `book-${bookObject.id}`);

    return article;
}

function moveBetweenBookshelfList(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = !bookTarget.isCompleted;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function deleteFromBookshelfList(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;

    const bookTitle = findBook(bookId).title;
    if (confirm(`Apakah kamu yakin untuk menghapus buku berjudul\n${bookTitle}?`)) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        const searchBookTarget = findSearchBookIndex(bookId);
        if (bookTarget === -1) return;

        searchBooks.splice(searchBookTarget, 1);
        document.dispatchEvent(new Event(SEARCH_EVENT));
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function findSearchBookIndex(bookId) {
    for (const index in searchBooks) {
        if (searchBooks[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}