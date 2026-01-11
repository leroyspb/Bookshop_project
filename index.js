// === СЛАЙДЕР ===
const projects = [
  {
    id: 1,
    name: "Banner blackfriday",
    image: "img/jpg/blackfriday.jpg",
  },
  {
    id: 2,
    name: "Banner checkout",
    image: "img/jpg/checkout.jpg",
  },
  {
    id: 3,
    name: "Banner top10",
    image: "img/jpg/top10.jpg",
  },
];

const mainImage = document.getElementById("main-image");
const dotsContainer = document.getElementById("dots-container");

let currentSlide = 0;
let slideInterval;
let autoPlayInterval;

// Инициализация слайдера
function initSlider() {
  projects.forEach((project, index) => {
    const dot = document.createElement("button");
    dot.className = `dot ${index === 0 ? "active" : ""}`;
    dot.setAttribute("data-index", index);
    dot.setAttribute(
      "aria-label",
      `Перейти к слайду ${index + 1}: ${project.name}`
    );

    const dotCircle = document.createElement("span");
    dotCircle.className = "dot-circle";
    dot.appendChild(dotCircle);

    dotsContainer.appendChild(dot);
  });

  updateProjectInfo(0);
}

// Обновление информации о проекте
function updateProjectInfo(index) {
  const project = projects[index];

  mainImage.style.opacity = "0";
  setTimeout(() => {
    mainImage.src = project.image;
    mainImage.alt = project.name;
    mainImage.style.opacity = "1";
  }, 200);

  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// Переход к слайду
function goToSlide(index) {
  if (index < 0) index = projects.length - 1;
  if (index >= projects.length) index = 0;

  currentSlide = index;
  updateProjectInfo(currentSlide);
}

// Обработчик для точек
dotsContainer.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("dot") ||
    e.target.classList.contains("dot-circle")
  ) {
    const dot = e.target.classList.contains("dot")
      ? e.target
      : e.target.parentElement;
    const index = parseInt(dot.getAttribute("data-index"));
    goToSlide(index);

    stopAutoPlay();
    clearInterval(slideInterval);
    setTimeout(startAutoPlay, 5000);
  }
});

// Функция для перехода к следующему слайду
function nextSlide() {
  goToSlide(currentSlide + 1);
}

// Функция для перехода к предыдущему слайду
function prevSlide() {
  goToSlide(currentSlide - 1);
}

// Автопрокрутка
function startAutoPlay() {
  clearInterval(slideInterval);
  autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

// Останавливаем автопрокрутку при взаимодействии
mainImage.addEventListener("mouseenter", stopAutoPlay);
mainImage.addEventListener("mouseleave", startAutoPlay);
dotsContainer.addEventListener("mouseenter", stopAutoPlay);
dotsContainer.addEventListener("mouseleave", startAutoPlay);

// === КАТЕГОРИИ И КНИГИ ===
const API_KEY = "AIzaSyDljF3mmU2TrLFTq74X_Zr2mq5PERSMlqg";
const BOOKS_PER_PAGE = 6;

// Глобальные переменные состояния
let currentCategory = "architecture";
let currentPage = 0;
let isLoading = false;
let hasMoreBooks = true;

// Корзина
let cart = JSON.parse(localStorage.getItem('bookshop_cart')) || [];

// Маппинг категорий
const categoryQueries = {
  architecture: "architecture",
  art: "art OR fashion",
  biography: "biography",
  business: "business",
  crafts: "crafts OR hobbies",
  drama: "drama",
  fiction: "fiction",
  food: "food OR drink OR cooking",
  health: "health OR wellbeing",
  history: "history OR politics",
  humor: "humor OR comedy",
  poetry: "poetry",
  psychology: "psychology",
  science: "science",
  technology: "technology",
  travel: "travel OR maps",
};

// ОДИН обработчик DOMContentLoaded для всего
window.addEventListener("DOMContentLoaded", () => {
  console.log("=== ИНИЦИАЛИЗАЦИЯ ===");
  
  // 1. Слайдер
  initSlider();
  startAutoPlay();
  
  // 2. Находим элементы
  const booksContainer = document.getElementById("books-container");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const categoryLinks = document.querySelectorAll(".category-link");
  
  // Проверяем элементы
  if (!booksContainer || !loadMoreBtn || categoryLinks.length === 0) {
    console.error("Ошибка: не все элементы найдены");
    return;
  }
  
  // 3. Настраиваем категории
  setupCategoryHandlers(categoryLinks, booksContainer, loadMoreBtn);
  
  // 4. Загружаем книги
  loadBooks(booksContainer, loadMoreBtn);
  
  // 5. Кнопка "Загрузить еще"
  loadMoreBtn.addEventListener("click", () => {
    loadMoreBooks(booksContainer, loadMoreBtn);
  });
  
  // 6. Инициализируем счетчик корзины при загрузке
  updateCartCounter();
  
  console.log("Инициализация завершена");
  console.log("Товаров в корзине:", cart.length);
});

// Настройка обработчиков категорий
function setupCategoryHandlers(categoryLinks, booksContainer, loadMoreBtn) {
  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const category = link.dataset.category;
      if (category === currentCategory) return;
      
      // Активная категория
      categoryLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      
      // Сбрасываем состояние
      currentCategory = category;
      currentPage = 0;
      hasMoreBooks = true;
      booksContainer.innerHTML = "";
      
      // Скрываем сообщение
      const noMoreBooks = document.getElementById("no-more-books");
      if (noMoreBooks) noMoreBooks.style.display = "none";
      
      // Показываем кнопку
      loadMoreBtn.style.display = "block";
      
      // Загружаем книги
      loadBooks(booksContainer, loadMoreBtn);
    });
  });
}

// Запрос книг из API
async function fetchBooks() {
  if (isLoading || !hasMoreBooks) return null;
  
  isLoading = true;
  setLoadingState(true);
  
  const startIndex = currentPage * BOOKS_PER_PAGE;
  const query = categoryQueries[currentCategory];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&startIndex=${startIndex}&maxResults=${BOOKS_PER_PAGE}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Ошибка загрузки книг:", error);
    showError("Не удалось загрузить книги");
    return [];
  } finally {
    isLoading = false;
    setLoadingState(false);
  }
}

// Загрузка книг
async function loadBooks(booksContainer, loadMoreBtn) {
  const books = await fetchBooks();
  
  if (books && books.length > 0) {
    renderBooks(books, booksContainer);
    currentPage++;
    
    if (books.length < BOOKS_PER_PAGE) {
      hasMoreBooks = false;
      loadMoreBtn.style.display = "none";
      const noMoreBooks = document.getElementById("no-more-books");
      if (noMoreBooks) noMoreBooks.style.display = "block";
    }
  } else if (currentPage === 0) {
    showNoBooksMessage(booksContainer);
  }
}

// Загрузка дополнительных книг
async function loadMoreBooks(booksContainer, loadMoreBtn) {
  if (isLoading) return;
  
  const books = await fetchBooks();
  
  if (books && books.length > 0) {
    renderBooks(books, booksContainer);
    currentPage++;
    
    if (books.length < BOOKS_PER_PAGE) {
      hasMoreBooks = false;
      loadMoreBtn.style.display = "none";
      const noMoreBooks = document.getElementById("no-more-books");
      if (noMoreBooks) noMoreBooks.style.display = "block";
    }
  }
}

// Отображение книг
function renderBooks(books, booksContainer) {
  books.forEach((book) => {
    const bookElement = createBookElement(book);
    booksContainer.appendChild(bookElement);
  });
}

// Создание элемента книги
function createBookElement(bookData) {
  const book = bookData.volumeInfo;
  const saleInfo = bookData.saleInfo;

  const bookCard = document.createElement("div");
  bookCard.className = "book-card";

  const thumbnail =
    book.imageLinks?.thumbnail ||
    "https://via.placeholder.com/212x300/EFEEF6/5C6A79?text=BOOK+COVER";

  const title = book.title || "Без названия";
  const shortTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;

  const authors = book.authors?.join(", ") || "Автор неизвестен";

  const description = book.description || "Описание недоступно.";
  const shortDescription =
    description.length > 80
      ? description.substring(0, 78) + "..."
      : description;

  // Рейтинг
  const rating = book.averageRating || Math.random() * 2 + 3;
  const reviewCount = book.ratingsCount || Math.floor(Math.random() * 1000);

  // ЦЕНА
  let priceHtml = '';
  let price = 0;
  let priceDisplay = '';

  if (saleInfo?.saleability === "FOR_SALE" && saleInfo.retailPrice) {
    price = saleInfo.retailPrice.amount || 0;
    const currency = saleInfo.retailPrice.currencyCode || "USD";

    if (currency === "USD") {
      price = price * 90;
    } else if (currency === "EUR") {
      price = price * 100;
    }

    priceDisplay = `${Math.round(price)} ₽`;
    priceHtml = `<div class="book_cost">${priceDisplay}</div>`;
    
  } else if (saleInfo?.saleability === "FREE") {
    priceDisplay = "БЕСПЛАТНО";
    price = 0;
    priceHtml = `<div class="book_cost">${priceDisplay}</div>`;
  }

  // Проверяем, есть ли книга в корзине
  const isInCart = cart.some(item => item.id === bookData.id);
  const buttonText = isInCart ? "IN THE CART" : "BUY NOW";
  const buttonClass = isInCart ? "in-cart-btn" : "buy-btn";

  bookCard.innerHTML = `
    <div class="bookshop_market__cards">
      <div class="card">
        <div class="picture">
          <img src="${thumbnail}" alt="${title}" class="book-image" loading="lazy">
        </div>
        <div class="card--info">
          <p class="book_author">${authors}</p>
          <p class="book_name">${shortTitle}</p>
          <div class="book_rating">
            ${createStarRating(rating)}
            <span class="review">(${reviewCount} отзывов)</span>
          </div>
          <div class="book_description">${shortDescription}</div>
          ${priceHtml}
          <button class="${buttonClass}" data-book-id="${bookData.id}" 
                  data-book-title="${title}" 
                  data-book-price="${price}">
            ${buttonText}
          </button>
        </div>
      </div>
    </div>
  `;

  // Добавляем обработчик клика на кнопку
  const button = bookCard.querySelector('button');
  button.addEventListener('click', handleCartButtonClick);

  return bookCard;
}

// Обработчик клика на кнопку корзины
function handleCartButtonClick(event) {
  const button = event.target;
  const bookId = button.getAttribute('data-book-id');
  const bookTitle = button.getAttribute('data-book-title');
  const bookPrice = parseFloat(button.getAttribute('data-book-price'));
  
  // Проверяем, есть ли книга уже в корзине
  const bookIndex = cart.findIndex(item => item.id === bookId);
  
  if (bookIndex === -1) {
    // Добавляем книгу в корзину
    cart.push({
      id: bookId,
      title: bookTitle,
      price: bookPrice
    });
    
    // Меняем вид кнопки
    button.textContent = "IN THE CART";
    button.classList.remove("buy-btn");
    button.classList.add("in-cart-btn");
    
    console.log(`Книга "${bookTitle}" добавлена в корзину`);
  } else {
    // Удаляем книгу из корзины
    cart.splice(bookIndex, 1);
    
    // Возвращаем вид кнопки
    button.textContent = "BUY NOW";
    button.classList.remove("in-cart-btn");
    button.classList.add("buy-btn");
    
    console.log(`Книга "${bookTitle}" удалена из корзины`);
  }
  
  // Сохраняем корзину в localStorage
  localStorage.setItem('bookshop_cart', JSON.stringify(cart));
  
  // Обновляем счетчик корзины
  updateCartCounter();
}

// Функция для обновления счетчика корзины
function updateCartCounter() {
  // Находим контейнер иконки корзины
  const bagContainer = document.querySelector('.nav_icon img[alt="icon bag"]')?.closest('.nav_icon');
  
  if (!bagContainer) {
    console.error("Не найдена иконка корзины");
    return;
  }
  
  // Удаляем старый счетчик если есть
  const oldCounter = bagContainer.querySelector('.cart-counter');
  if (oldCounter) {
    oldCounter.remove();
  }
  
  // Если в корзине есть товары, добавляем счетчик
  if (cart.length > 0) {
    const counterSpan = document.createElement('button');
    counterSpan.className = 'cart-counter';
    counterSpan.textContent = cart.length;
    
    // Добавляем счетчик в контейнер иконки
    bagContainer.appendChild(counterSpan);
    
    console.log(`Счетчик корзины обновлен: ${cart.length} книг`);
  } else {
    console.log("Корзина пуста, счетчик скрыт");
  }
}

// Создание звезд рейтинга
function createStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return `<span class="stars">${stars}</span>`;
}

// Состояние загрузки
function setLoadingState(isLoading) {
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (!loadMoreBtn) return;
  
  const btnText = loadMoreBtn.querySelector(".btn-text");
  const spinner = loadMoreBtn.querySelector(".btn-spinner");
  
  if (!btnText || !spinner) return;
  
  if (isLoading) {
    btnText.textContent = "Загрузка...";
    spinner.style.display = "inline-block";
    loadMoreBtn.disabled = true;
  } else {
    btnText.textContent = "Load More";
    spinner.style.display = "none";
    loadMoreBtn.disabled = false;
  }
}

// Сообщение об ошибке
function showError(message) {
  const booksContainer = document.getElementById("books-container");
  if (!booksContainer) return;
  
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: #fee;
    color: #c00;
    padding: 15px;
    border-radius: 5px;
    margin: 20px 0;
    text-align: center;
  `;

  booksContainer.parentNode.insertBefore(errorDiv, booksContainer.nextSibling);

  setTimeout(() => errorDiv.remove(), 5000);
}

// Нет книг
function showNoBooksMessage(booksContainer) {
  booksContainer.innerHTML = `
    <div class="no-books-message" style="
      grid-column: 1 / -1;
      text-align: center;
      padding: 50px;
      color: #666;
      font-size: 1.2rem;
    ">
      <i class="fas fa-book-open" style="font-size: 3rem; margin-bottom: 20px; color: #ddd;"></i>
      <p>Книги в этой категории не найдены.</p>
    </div>
  `;
}

// Для отладки
window.bookStore = {
  fetchBooks,
  loadBooks,
  loadMoreBooks,
  currentCategory,
  currentPage,
  cart
};