class Book {
	constructor(title, author, pages, read) {
		this.id = crypto.randomUUID();
		this.title = title;
		this.author = author;
		this.pages = +pages;
		this.read = read;
	}
}
class Library {
	constructor(initialBooks = localStorage.getItem("books") ? JSON.parse(localStorage.getItem("books")) : []) {
		this.books = initialBooks;
		this.container = document.querySelector("#books");
		this.dialog = document.querySelector("dialog");

		this.dialogTitle = this.dialog.querySelector("input#title");
		this.dialogAuthor = this.dialog.querySelector("input#author");
		this.dialogPages = this.dialog.querySelector("input#pages");
		this.dialogRead = this.dialog.querySelector("input#read");
		// handle add new book form
		const openDialogBtn = document.querySelector("button[data-action='openDialog']");
		const closeBtn = document.querySelector("button[data-action=closeDialog]");
		const dialogForm = document.querySelector("form[method=dialog]");

		openDialogBtn.addEventListener("click", () => {
			this.openAddForm();
		});
		closeBtn.addEventListener("click", () => {
			this.closeForm();
		});
		dialogForm.addEventListener("submit", (e) => {
			e.preventDefault();

			const currentMode = this.dialog.dataset.mode;
			if (currentMode === "add") {
				const book = new Book(this.dialogTitle.value, this.dialogAuthor.value, this.dialogPages.value, this.dialogRead.checked);
				this.addBook(book);
			} else if (currentMode === "edit") {
				const id = this.dialog.dataset.bookId;
				this.editBook(id);
			}

			this.closeForm();
		});
		this.displayBooks();
	}
	displayBooks() {
		while (this.container.lastElementChild && this.container.lastElementChild.id !== "openDialogBtn") {
			this.container.removeChild(this.container.lastElementChild);
		}
		for (const [index, book] of this.books.entries()) {
			const card = createCard(book, index);
			this.container.appendChild(card);
		}
		this.addBookListeners();
		localStorage.setItem("books", JSON.stringify(this.books));
	}
	addBook(book) {
		if (this.checkIfBookExists(book)) return;
		this.books = [...this.books, book];
		this.displayBooks();
	}
	addBookListeners() {
		const self = this;
		const bookElements = self.container.querySelectorAll("[data-component=card]");
		bookElements.forEach((bookElement) => {
			const deleteBtn = bookElement.querySelector("button[data-action=delete]");
			const editBtn = bookElement.querySelector("button[data-action=edit]");
			const id = deleteBtn.dataset.id;

			deleteBtn.addEventListener("click", () => self.deleteBook(id));
			editBtn.addEventListener("click", () => self.openEditForm(id));
		});
	}
	deleteBook(id) {
		const newBooks = this.books.filter((book) => book.id !== id);
		this.books = newBooks;
		this.displayBooks();
	}
	editBook(id) {
		const title = this.dialogTitle.value;
		const author = this.dialogAuthor.value;
		const pages = this.dialogPages.value;
		const read = this.dialogRead.checked;
		const newBooks = this.books.map((book) => {
			if (book.id === id) {
				console.log(book.id);
				return {
					...book,
					title,
					author,
					pages,
					read,
				};
			} else {
				console.log(book.id);
				return book;
			}
		});
		this.books = newBooks;
		this.displayBooks();
	}
	openAddForm() {
		this.dialog.dataset.bookId = "";
		this.dialog.dataset.mode = "add";
		const button = this.dialog.querySelector("[data-action]:not([data-action=closeDialog])");
		button.dataset.action = "addNewBook";
		button.textContent = "Add";
		resetInputFields.bind(this)();
		this.dialog.showModal();

		function resetInputFields() {
			this.dialogTitle.value = "";
			this.dialogAuthor.value = "";
			this.dialogPages.value = "";
			this.dialogRead.checked = false;
		}
	}
	openEditForm(id) {
		this.dialog.dataset.bookId = id;
		this.dialog.dataset.mode = "edit";
		const button = this.dialog.querySelector("[data-action]:not([data-action=closeDialog])");
		button.dataset.action = "editBook";
		button.textContent = "Edit";
		updateFormValues.bind(this)(id);
		this.dialog.showModal();

		function updateFormValues(id) {
			const book = this.books.find((book) => book.id === id);
			this.dialogTitle.value = book.title;
			this.dialogAuthor.value = book.author;
			this.dialogPages.value = book.pages;
			this.dialogRead.checked = book.read;
		}
	}
	closeForm() {
		const dialog = document.querySelector("dialog");

		dialog.close();
	}
	isEmpty() {
		return this.books.length === 0;
	}
	checkIfBookExists(newBook) {
		if (this.books.some((book) => book.title === newBook.title)) {
			alert("Book already exists");
			return true;
		}
	}
}

const myLibrary = new Library();

function createDomElement(tag = "div", twClasses = "", content = "") {
	const element = document.createElement(tag);
	element.className = twClasses;
	element.textContent = content;
	return element;
}

function createCard({ id, title, author, pages, read }, index) {
	const cardWrapperElem = createDomElement("div", "relative group cursor-pointer shadow-lg shadow-blue-400/20 min-w-[400px] md:min-w-0");
	cardWrapperElem.dataset.component = "card";
	const cardCoverElem = createDomElement("div", "absolute z-10 rounded-lg h-[calc(100%+160px)] -translate-y-[160px] w-full overflow-hidden pointer-events-none");
	const upperCardCoverElem = createDomElement(
		"div",
		`absolute bg-black/80 bg-[image:url(./images/metal-pattern.svg)] bg-blend-overlay top-0 left-0 h-1/2 w-full z-10 animate-[cardCoverUp_800ms_${200 * index}ms_forwards_linear]`
	);
	const lowerCardCoverElem = createDomElement(
		"div",
		`absolute bg-black/80 bg-[image:url(./images/metal-pattern.svg)] bg-blend-overlay bottom-0 left-0 h-1/2 w-full z-10 animate-[cardCoverDown_800ms_${200 + 200 * index}ms_forwards_linear]`
	);
	cardCoverElem.append(upperCardCoverElem, lowerCardCoverElem);
	const bookCoverElem = createDomElement(
		"div",
		`absolute left-0 bottom-full w-full min-h-[400px] bg-[image:url(https://unsplash.it/300/300?id=${index})] bg-no-repeat bg-cover bg-center rounded-lg translate-y-[60%] duration-200 ease-in-out hover:translate-y-[30%] peer`
	);
	bookCoverElem.setAttribute("id", "bookCover");
	const cardContentWrapperElem = createDomElement(
		"div",
		"relative shadow-lg shadow-black/30 rounded-lg bg-[image:url(./images/cardBgPattern.svg),_linear-gradient(#0d71d7,#0d71d7_20%,black)] animate-[movingBackground_20s_infinite_both_alternate] bg-blend-overlay text-white relative duration-200 ease-in-out peer-hover:translate-y-[30%]"
	);
	const cardTitleElem = createDomElement("h2", "text-4xl text-center py-16 font-bold relative");
	const cardTitleUpperDecorativeLineElem = createDomElement("span", "absolute h-2 top-10 left-0 w-full bg-sky-600/20");
	const cardTitleTextElem = createDomElement("span", "relative bg-sky-600/20 p-4 rounded-lg drop-shadow-lg", title);
	const cardTitleLowerDecorativeLineElem = createDomElement("span", "absolute h-2 bottom-10 left-0 w-full bg-sky-600/20");
	cardTitleElem.append(cardTitleUpperDecorativeLineElem, cardTitleTextElem, cardTitleLowerDecorativeLineElem);

	const cardDescElem = createDomElement("div", "pb-24 text-white space-y-4 px-12 text-xl");

	const cardAuthorElem = createDomElement("p", "grid grid-cols-[1fr_90px]");
	const cardAuthorLabelElem = createDomElement("span", "", "Author: ");
	const cardAuthorValueElem = createDomElement("span", "justify-self-start", author);
	cardAuthorElem.append(cardAuthorLabelElem, cardAuthorValueElem);

	const cardPagesElem = createDomElement("p", "grid grid-cols-[1fr_90px]");
	const cardPagesLabelElem = createDomElement("span", "", "Pages: ");
	const cardPagesValueElem = createDomElement("span", "justify-self-start", pages);
	cardPagesElem.append(cardPagesLabelElem, cardPagesValueElem);

	const cardReadElem = createDomElement("p", "grid grid-cols-[1fr_90px]");
	const cardReadLabelElem = createDomElement("span", "", "Read: ");
	const cardReadValueElem = createDomElement("span", "justify-self-start", read ? "Yes" : "No");
	cardReadElem.append(cardReadLabelElem, cardReadValueElem);

	cardDescElem.append(cardAuthorElem, cardPagesElem, cardReadElem);

	const cardButtonsWrapperElem = createDomElement("div", "flex items-center gap-6 [&>*]:flex-1");

	const cardEditButtonElem = createDomElement(
		"button",
		"bg-gradient-to-r from-yellow-600 from-[50%] to-yellow-500 to-[50%] bg-[length:200%] bg-[position:100%] duration-200 ease-in-out py-4 rounded shadow-lg shadow-black/60 grid place-content-center hover:bg-[position:0%]"
	);
	cardEditButtonElem.dataset.action = "edit";
	cardEditButtonElem.dataset.id = id;
	const cardEditButtonImageWrapperElem = createDomElement("div", "w-8 text-white");
	cardEditButtonImageWrapperElem.insertAdjacentHTML(
		"afterBegin",
		`<svg
xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="currentColor"
>
	<path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
</svg>`
	);
	cardEditButtonElem.appendChild(cardEditButtonImageWrapperElem);

	const cardDeleteButtonElem = createDomElement(
		"button",
		"bg-gradient-to-r from-red-600 from-[50%] to-red-800 to-[50%] bg-[length:200%] bg-[position:0%] duration-200 ease-in-out py-4 rounded shadow-lg shadow-black/60 grid place-content-center hover:bg-[position:100%]"
	);
	cardDeleteButtonElem.dataset.action = "delete";
	cardDeleteButtonElem.dataset.id = id;
	const cardDeleteButtonImageWrapperElem = createDomElement("div", "w-8 text-white");
	cardDeleteButtonImageWrapperElem.insertAdjacentHTML(
		"afterBegin",
		`<svg
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
>
	<path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
</svg>`
	);
	cardDeleteButtonElem.appendChild(cardDeleteButtonImageWrapperElem);

	cardButtonsWrapperElem.append(cardEditButtonElem, cardDeleteButtonElem);

	cardContentWrapperElem.append(cardTitleElem, cardDescElem, cardButtonsWrapperElem);

	cardWrapperElem.append(cardCoverElem, bookCoverElem, cardContentWrapperElem);

	return cardWrapperElem;
}

const bookCovers = document.querySelectorAll("#bookCover");
bookCovers.forEach((bookCover) => {
	bookCover.addEventListener("mouseover", (e) => {
		document.body.style.minHeight = `300vh`;
	});
	bookCover.addEventListener("mouseout", (e) => {
		document.body.style.minHeight = `100vh`;
	});
});
