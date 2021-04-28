let myLibrary = [];
let submitForm = document.getElementById("form-add");
var bookContainer = document.getElementById("books-container");
let btnOut = document.getElementById("btn-logout");
let btnLocalMode = document.getElementById("btn-local-mode")
var btnNew = document.getElementById("btn-new");
var btnSubmit = document.getElementById("btn-submit");
let formPara = document.getElementById("para-form");
let login = document.getElementById("login");
var database = firebase.database();
let dbRef = firebase.database().ref();
var uid = "";
let mode = "";

function Book() { }

Book.prototype.sayBook = function() {
  console.log(this.title + " by " + this.author);
}

function AddBook(title, author, pages, haveRead) {
  this.title = title
  this.author = author
  this.pages = pages
  this.haveRead = haveRead
  myLibrary.push(this);
  if(mode == "local"){
    storeBooks();
  }else if(mode == "web"){
    storeBooksWeb();
  }
  displayBooks();
}

AddBook.prototype = Object.create(Book.prototype)

var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ]
})

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      console.log("Sign in successful");
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: "index.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
};

function storeBooksWeb(){
  firebase.database().ref('users/' + uid).set(myLibrary);
}

function getBooksWeb(){
  dbRef.child("users").child(uid).get().then((snapshot) => {
    if (snapshot.exists()) {
      console.table(snapshot.val());
      myLibrary = snapshot.val();
      renderBooks();
    } else {
      return;
    }
  })
}

function testLog(){
  let dbRef = firebase.database().ref();
  dbRef.child("users").child(uid).get().then((snapshot) => {
    if (snapshot.exists()) {
      let dbRef = snapshot.val();
      console.log(dbRef);
    } else {
      console.log("No data available");
    }
  })
  console.log(dbRef);
}

//USER AUTH STATE OBSERVER
ui.start('#firebaseui-auth-contaier', uiConfig);
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    mode = "web";
    login.style.display = "none";
    uid = user.uid;
    console.log(uid);
    console.log("log in success");
    displayBooks();
  } else {
    // user has singed out
    login.style.display = "flex";
  }
});

btnOut.addEventListener("click", function(){
  firebase.auth().signOut().then(() => {
    //Sign-out successfull
    console.log("Successfully Signed-Out");
    login.style.display = "flex";
  }).catch((error) => {
    //Sign-out error
    console.error("Sign-Out error", error);
  });
});

btnLocalMode.addEventListener("click", function() {
  mode = "local";
  login.style.display = "none";
  displayBooks();
})

document.onload = displayBooks();

function storeBooks(){
  window.localStorage.setItem('books', JSON.stringify(myLibrary));
}
function downBooks(){
  return JSON.parse(window.localStorage.getItem('books'));
}

function displayBooks(){
  document.querySelectorAll(".book").forEach(el => el.remove());
  if(mode == "local"){
    //CHECK IF LOCALSTORAGE POPULATED
    if(!localStorage.getItem('books')){
      let theHobbit = new AddBook("The Hobbit", "J.R.R. Tolkien", '310', false)
      let braveNewWorld = new AddBook("Brave New World", "Aldous Huxley", '311', true)
      renderBooks();
    }else{
      myLibrary = downBooks();
      renderBooks();
      console.table(myLibrary);
    }
  }else if(mode == "web"){
    getBooksWeb();
    console.table(myLibrary);
  }
  console.log("test 2");
  console.table(myLibrary);
  
    //DELETE BUTTONS
    var btnsDelete = document.querySelectorAll(".btn-delete");
    btnsDelete.forEach(btn => btn.addEventListener("click", function(){
    let a = btn.id.substring(11);
    let b = document.getElementById("book-" + a);
    fadeOut(b);
    b.ontransitionend = () => {
      myLibrary.splice(a, 1);
      b.remove();
      if(mode == "local"){
        storeBooks();
      }else if(mode == "web"){
        storeBooksWeb();
      }
      displayBooks();
    }
  }));
    //HAVE READ BUTTON
    var btnsRead = document.querySelectorAll(".btn-read");
    btnsRead.forEach(btn => btn.addEventListener("click", function(){
    let a = btn.id.substring(10);
    if (btn.checked == true) {
      myLibrary[a].haveRead = true;
      storeBooks();
      displayBooks();
    }else{
      myLibrary[a].haveRead = false;
      storeBooks();
      displayBooks();
    }
  }));
}

//SUBMIT BOOK BUTTON
btnSubmit.addEventListener("click", function(){
  if(authorInput.value.length < 1 ||
      titleInput.value.length < 1 ||
      pagesInput.value.length < 1) {
    formPara.innerHTML = "Please fill out all fields!";
  }else{
    fadeOut(submitForm);
    submitForm.ontransitionend = () => {
      let title = document.getElementById("title").value;
      let author = document.getElementById("author").value;
      let pages = document.getElementById("pages").value;
      let haveRead = document.getElementById("have-read").checked;
      new AddBook(title, author, pages, haveRead);

      document.getElementById("form-add").style.display = "none";
    }
  }
});

//SHOW ADD BOOK FORM BUTTON
btnNew.addEventListener("click", function(){
  if(submitForm.style.display == "flex"){
    fadeOut(submitForm);
    submitForm.ontransitionend = () => {
      submitForm.style.display = "none";
    }
  }else{
    submitForm.style.display = "flex";
    fadeIn(submitForm);
  }
});

//CLOSE ADD BOOK FORM BUTTON
let btnCloseForm = document.getElementById("btn-form-close");
btnCloseForm.setAttribute("type", "button");
btnCloseForm.addEventListener("click", function(){
  fadeOut(submitForm);
  submitForm.ontransitionend = () => {
    document.getElementById("form-add").style.display = "none";
  }
});

function renderBooks() {
  for (let i = 0; i < myLibrary.length; i++) {
    var book = document.createElement("div");
    var paraBookTitle = document.createElement("p");
    var paraBookAuthor = document.createElement("p");
    var paraBookPages = document.createElement("p");
    var paraBookRead = document.createElement("p");
    var btnDelete = document.createElement("button");
    var btnRead = document.createElement("input");
    var btnReadLabel = document.createElement("label");
    var btnReadSpan = document.createElement("span");
    //BOOK ELEMENT
    book.setAttribute("id", "book-" + i);
    book.classList.add("book");
    paraBookTitle.setAttribute("id", "para-title-" + i);
    paraBookTitle.setAttribute("class", "para-book");
    paraBookTitle.innerHTML = "Title: " + myLibrary[i].title;
    paraBookAuthor.setAttribute("id", "para-author-" + i);
    paraBookAuthor.setAttribute("class", "para-book");
    paraBookAuthor.innerHTML = "Author: " + myLibrary[i].author;
    paraBookPages.setAttribute("id", "para-pages-" + i);
    paraBookPages.setAttribute("class", "para-book");
    paraBookPages.innerHTML = myLibrary[i].pages + " Pages";
    paraBookRead.setAttribute("id", "para-read-" + i);
    paraBookRead.setAttribute("class", "para-book");
    //BUTTON DELETE ELEMENT
    btnDelete.setAttribute("id", "btn-delete-" + i);
    btnDelete.setAttribute("class", "btn-delete");
    //BUTTON HAVE READ ELEMENT
    btnRead.setAttribute("type", "checkbox");
    btnRead.setAttribute("id", "book-read-" + i);
    btnRead.setAttribute("class", "btn-read");
    btnReadLabel.setAttribute("class", "switch");
    btnReadSpan.setAttribute("class", "slider round");
    if (myLibrary[i].haveRead == true) {
      paraBookRead.innerHTML = "You have read this book.";
      btnRead.checked = true;
    } else {
      paraBookRead.innerHTML = "You haven't read this book.";
      btnRead.checked = false;
    }
    //LOCAL STORAGE
    if (!localStorage.getItem(myLibrary)) {
    }
    //APPENDING ELEMENTS
    bookContainer.appendChild(book);
    book.appendChild(paraBookTitle);
    book.appendChild(paraBookAuthor);
    book.appendChild(paraBookPages);
    book.appendChild(paraBookRead);
    btnReadLabel.appendChild(btnRead);
    btnReadLabel.appendChild(btnReadSpan);
    book.appendChild(btnDelete);
    book.appendChild(btnReadLabel);
  }
}

//FADE ANIMATION FUNCTIONS
function fadeOut(el){
	el.style.transition = "opacity 0.5s linear 0s";
	el.style.opacity = 0;
}
function fadeIn(el){
	el.style.transition = "opacity 0.5s linear 0s";
	el.style.opacity = 1;
}

//LIMIT FORM VALUES
let pagesInput = document.getElementById("pages");
pagesInput.oninput = function () {
  if (this.value > 5000) {
    this.value = 0;
    formPara.innerHTML = "That's too many pages!"
  }
}

let titleInput = document.getElementById("title");
titleInput.oninput = function() {
  if (this.value.length > 50){
    this.value = "";
    formPara.innerHTML = "That title seems too long!";
  }
}

let authorInput = document.getElementById("author");
authorInput.oninput = function(){
  if(this.value.length > 25){
    this.value = "";
    formPara.innerHTML = "That name seems too long!";
  }
}