// Данные проектов для слайдера
const projects = [
    {
        id: 1,
        name: "Banner blackfriday",
        image: "img/jpg/blackfriday.jpg"
    },
    {
        id: 2,
        name: "Banner checkout",
        image: "img/jpg/checkout.jpg"
    },
    {
        id: 3,
        name: "Banner top10",
        image: "img/jpg/top10.jpg"
    }
];

// Элементы DOM
const mainImage = document.getElementById('main-image');
const dotsContainer = document.getElementById('dots-container');

let currentSlide = 0;
let slideInterval;

// Инициализация слайдера
function initSlider() {
    // Создаем точки навигации
    projects.forEach((project, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', index);
        dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}: ${project.name}`);
        
        // Создаем элемент для точки (кружок)
        const dotCircle = document.createElement('span');
        dotCircle.className = 'dot-circle';
        dot.appendChild(dotCircle);
        
        dotsContainer.appendChild(dot);
    });

    // Обновляем информацию для первого слайда
    updateProjectInfo(0);
}

// Обновление информации о проекте
function updateProjectInfo(index) {
    const project = projects[index];
    
    // Обновляем изображение с плавным переходом
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.src = project.image;
        mainImage.alt = project.name;
        mainImage.style.opacity = '1';
    }, 200);
    
    // Обновляем точки
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
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
dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot') || e.target.classList.contains('dot-circle')) {
        const dot = e.target.classList.contains('dot') ? e.target : e.target.parentElement;
        const index = parseInt(dot.getAttribute('data-index'));
        goToSlide(index);
        
        // Останавливаем автопрокрутку при ручном переключении
        stopAutoPlay();
        clearInterval(slideInterval); // Очищаем предыдущий интервал
        setTimeout(startAutoPlay, 5000); // Возобновляем через 5 секунд
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
let autoPlayInterval;
function startAutoPlay() {
    clearInterval(slideInterval);
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Останавливаем автопрокрутку при взаимодействии
mainImage.addEventListener('mouseenter', stopAutoPlay);
mainImage.addEventListener('mouseleave', startAutoPlay);
dotsContainer.addEventListener('mouseenter', stopAutoPlay);
dotsContainer.addEventListener('mouseleave', startAutoPlay);

mainImage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

mainImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});


// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initSlider();
    startAutoPlay();
    
    // Добавляем доступность для точек
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
    });
});