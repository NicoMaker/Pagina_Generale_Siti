let isPreloaderActive = false
const projectsSection = document.querySelector("#projects")
let categoriesData
const navLinks = document.querySelectorAll(".nav-link")
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")
let updateCounters

// Load categories data from JSON
async function loadCategoriesData() {
  try {
    const response = await fetch("categories.json")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    categoriesData = await response.json()
    console.log("Categories data loaded:", categoriesData)

    // Initialize the page with loaded data
    if (categoriesData && categoriesData.categories) {
      renderCategories(categoriesData.categories)
      renderCategoryNavigation(categoriesData.categories)
      if (updateCounters) {
        updateCounters(categoriesData.categories)
      }
    }
  } catch (error) {
    console.error("Error loading categories data:", error)
    // Fallback: you could load a default set of categories here
  }
}

// Function to render categories with icons from JSON
function renderCategories(categories) {
  const categoriesContainer = document.querySelector("#categories-container")
  if (!categoriesContainer) return

  categoriesContainer.innerHTML = ""

  Object.entries(categories).forEach(([categoryName, categoryData]) => {
    const categoryElement = document.createElement("div")
    categoryElement.className = "category-section"
    categoryElement.innerHTML = `
      <div class="category-header">
        <span class="category-icon">${categoryData.icon}</span>
        <h3 class="category-title">${categoryName}</h3>
        <span class="project-count">${categoryData.projects.length} progetti</span>
      </div>
      <div class="projects-grid">
        ${categoryData.projects
        .map(
          (project) => `
          <div class="project-card">
            <a href="${project.link}" target="_blank" rel="noopener noreferrer">
              <div class="project-icon">${categoryData.icon}</div>
              <h4 class="project-name">${project.name}</h4>
            </a>
          </div>
        `,
        )
        .join("")}
      </div>
    `
    categoriesContainer.appendChild(categoryElement)
  })
}

// Function to render category navigation with icons
function renderCategoryNavigation(categories) {
  const navContainer = document.querySelector("#category-nav")
  if (!navContainer) return

  navContainer.innerHTML = ""

  Object.entries(categories).forEach(([categoryName, categoryData]) => {
    const navItem = document.createElement("button")
    navItem.className = "category-nav-item"
    navItem.innerHTML = `
      <span class="nav-icon">${categoryData.icon}</span>
      <span class="nav-text">${categoryName}</span>
      <span class="nav-count">${categoryData.projects.length}</span>
    `

    navItem.addEventListener("click", () => {
      // Remove active class from all nav items
      document.querySelectorAll(".category-nav-item").forEach((item) => {
        item.classList.remove("active")
      })

      // Add active class to clicked item
      navItem.classList.add("active")

      // Filter and show only this category
      filterByCategory(categoryName, categories)
    })

    navContainer.appendChild(navItem)
  })

  // Add "All" button
  const allButton = document.createElement("button")
  allButton.className = "category-nav-item active"
  allButton.innerHTML = `
    <span class="nav-icon">📂</span>
    <span class="nav-text">Tutte</span>
    <span class="nav-count">${Object.values(categories).reduce((total, cat) => total + cat.projects.length, 0)}</span>
  `

  allButton.addEventListener("click", () => {
    document.querySelectorAll(".category-nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    allButton.classList.add("active")
    renderCategories(categories)
  })

  navContainer.insertBefore(allButton, navContainer.firstChild)
}

// Function to filter categories
function filterByCategory(categoryName, categories) {
  const filteredCategories = {
    [categoryName]: categories[categoryName],
  }
  renderCategories(filteredCategories)
}

// Update counters function
updateCounters = (categories) => {
  const totalProjects = Object.values(categories).reduce((total, cat) => total + cat.projects.length, 0)
  const totalCategories = Object.keys(categories).length

  // Update counter elements if they exist
  const projectCounter = document.querySelector("#project-counter")
  const categoryCounter = document.querySelector("#category-counter")

  if (projectCounter) projectCounter.textContent = totalProjects
  if (categoryCounter) categoryCounter.textContent = totalCategories
}

// Preloader function
function showPreloader() {
  if (isPreloaderActive) return

  isPreloaderActive = true

  if (projectsSection && projectsSection.style.display === "block") {
    projectsSection.style.display = "none"
  }

  try {
    let currentPreloader = document.querySelector(".preloader")

    if (!currentPreloader) {
      currentPreloader = document.createElement("div")
      currentPreloader.className = "preloader"
      currentPreloader.innerHTML = `
        <div class="preloader-content">
          <div class="avatar-container">
            <img src="Icons/Avatar.jpg" alt="Nico Maker Avatar" class="preloader-avatar">
          </div>
          <div class="logo-container">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_chiaro.jpg-d1WCG74xFBZkcoQrlmO4SobXjTaScn.png"
              alt="Nico Maker Logo" class="preloader-logo">
          </div>
          <div class="text-container">
            <h2 class="preloader-text">Pagina Generale Siti</h2>
          </div>
          <div class="loading-bar-container">
            <div class="loading-bar"></div>
          </div>
        </div>
      `
      document.body.prepend(currentPreloader)
    } else {
      currentPreloader.classList.remove("hidden")

      const loadingBar = currentPreloader.querySelector(".loading-bar")
      if (loadingBar) {
        loadingBar.style.animation = "none"
        void loadingBar.offsetWidth
        loadingBar.style.animation = "loadingProgress 2s ease forwards"
      }
    }

    document.body.style.overflow = "hidden"

    setTimeout(() => {
      const updatedPreloader = document.querySelector(".preloader")
      if (updatedPreloader) {
        updatedPreloader.classList.add("hidden")
      }
      document.body.style.overflow = "auto"
      isPreloaderActive = false

      window.scrollTo({
        top: 0,
        behavior: "auto",
      })

      // Reload data after preloader
      if (categoriesData && categoriesData.categories) {
        renderCategories(categoriesData.categories)
        renderCategoryNavigation(categoriesData.categories)
        if (updateCounters) {
          updateCounters(categoriesData.categories)
        }
      }

      // Update navigation active states
      navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === "#home") {
          link.classList.add("active")
        }
      })

      mobileNavLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === "#home") {
          link.classList.add("active")
        }
      })
    }, 3000)
  } catch (error) {
    console.error("Errore nel preloader:", error)
    document.body.style.overflow = "auto"
    isPreloaderActive = false
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const preloader = document.querySelector(".preloader")
  const categoriesGrid = document.getElementById("categoriesGrid")
  const categoryNavContainer = document.getElementById("categoryNavContainer")
  const projectsSection = document.getElementById("projectsSection")
  const projectsGrid = document.getElementById("projectsGrid")
  const categoryTitle = document.getElementById("categoryTitle")
  const backButton = document.getElementById("backButton")
  const searchInput = document.getElementById("searchInput")
  const projectSearchInput = document.getElementById("projectSearchInput")
  const noProjectsFound = document.getElementById("noProjectsFound")
  const noCategoriesFound = document.getElementById("noCategoriesFound")
  const menuToggle = document.querySelector(".menu-toggle")
  const mobileMenu = document.querySelector(".mobile-menu")
  const mobileClose = document.querySelector(".mobile-close")
  const themeToggle = document.querySelector(".theme-toggle")
  const themeToggleMobile = document.querySelector(".theme-toggle-mobile")
  const backToTopButton = document.getElementById("backToTop")
  const categoriesCount = document.getElementById("categoriesCount")
  const projectsCount = document.getElementById("projectsCount")
  const currentYearElement = document.getElementById("currentYear")
  const headerLogo = document.querySelector(".header .logo")
  const logoText = document.querySelector(".header .logo span")
  const mobileLogoContainer = document.querySelector(".mobile-logo-container")
  const mobileLogoText = document.querySelector(".mobile-logo-container h2")

  // Variables
  let categoriesData = null
  let isPreloaderActive = false

  // Restore active section from localStorage if available
  const savedActiveSection = localStorage.getItem("activeSection")
  if (savedActiveSection) {
    const sectionElement = document.getElementById(savedActiveSection)
    if (sectionElement) {
      navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${savedActiveSection}`) {
          link.classList.add("active")
        }
      })

      mobileNavLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${savedActiveSection}`) {
          link.classList.add("active")
        }
      })
    }
  }

  // Set current year in footer
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }

  // Advanced preloader with loading bar
  function simulateLoading() {
    setTimeout(() => {
      const currentPreloader = document.querySelector(".preloader")
      if (currentPreloader) {
        currentPreloader.classList.add("hidden")
      }
      document.body.style.overflow = "auto"
      isPreloaderActive = false
    }, 3000)
  }

  // Function to show preloader
  function showPreloader() {
    if (isPreloaderActive) return

    isPreloaderActive = true

    if (projectsSection && projectsSection.style.display === "block") {
      projectsSection.style.display = "none"
    }

    try {
      let currentPreloader = document.querySelector(".preloader")

      if (!currentPreloader) {
        currentPreloader = document.createElement("div")
        currentPreloader.className = "preloader"
        currentPreloader.innerHTML = `
          <div class="preloader-content">
            <div class="avatar-container">
              <img src="Icons/Avatar.jpg" alt="Nico Maker Avatar" class="preloader-avatar">
            </div>
            <div class="logo-container">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_chiaro.jpg-d1WCG74xFBZkcoQrlmO4SobXjTaScn.png"
                alt="Nico Maker Logo" class="preloader-logo">
            </div>
            <div class="text-container">
              <h2 class="preloader-text">Pagina Generale Siti</h2>
            </div>
            <div class="loading-bar-container">
              <div class="loading-bar"></div>
            </div>
          </div>
        `
        document.body.prepend(currentPreloader)
      } else {
        currentPreloader.classList.remove("hidden")

        const loadingBar = currentPreloader.querySelector(".loading-bar")
        if (loadingBar) {
          loadingBar.style.animation = "none"
          void loadingBar.offsetWidth
          loadingBar.style.animation = "loadingProgress 2s ease forwards"
        }
      }

      document.body.style.overflow = "hidden"

      setTimeout(() => {
        const updatedPreloader = document.querySelector(".preloader")
        if (updatedPreloader) {
          updatedPreloader.classList.add("hidden")
        }
        document.body.style.overflow = "auto"
        isPreloaderActive = false

        window.scrollTo({
          top: 0,
          behavior: "auto",
        })

        if (categoriesData) {
          renderCategories(categoriesData)
          renderCategoryNavigation(categoriesData)
          updateCounters(categoriesData)
        }

        navLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === "#home") {
            link.classList.add("active")
          }
        })

        mobileNavLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === "#home") {
            link.classList.add("active")
          }
        })
      }, 3000)
    } catch (error) {
      console.error("Errore nel preloader:", error)
      document.body.style.overflow = "auto"
      isPreloaderActive = false
    }
  }

  // Add click events to header logos
  if (headerLogo) {
    headerLogo.addEventListener("click", (e) => {
      e.preventDefault()
      showPreloader()
    })
  }

  if (logoText) {
    logoText.addEventListener("click", (e) => {
      e.preventDefault()
      showPreloader()
    })
  }

  if (mobileLogoContainer) {
    mobileLogoContainer.addEventListener("click", (e) => {
      e.preventDefault()
      showPreloader()

      const menuToggle = document.querySelector(".menu-toggle")
      const mobileMenu = document.querySelector(".mobile-menu")
      if (menuToggle && mobileMenu) {
        menuToggle.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.classList.remove("no-scroll")
      }
    })
  }

  if (mobileLogoText) {
    mobileLogoText.addEventListener("click", (e) => {
      e.preventDefault()
      showPreloader()

      const menuToggle = document.querySelector(".menu-toggle")
      const mobileMenu = document.querySelector(".mobile-menu")
      if (menuToggle && mobileMenu) {
        menuToggle.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.classList.remove("no-scroll")
      }
    })
  }

  // Hide preloader after page load
  window.addEventListener("load", () => {
    document.body.style.overflow = "hidden"
    simulateLoading()
  })

  // Custom cursor
  const cursorDot = document.querySelector(".cursor-dot")
  const cursorOutline = document.querySelector(".cursor-dot-outline")

  if (window.innerWidth > 768 && cursorDot && cursorOutline) {
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX
      const posY = e.clientY

      cursorDot.style.left = `${posX}px`
      cursorDot.style.top = `${posY}px`
      cursorOutline.style.left = `${posX}px`
      cursorOutline.style.top = `${posY}px`

      cursorDot.style.opacity = "1"
      cursorOutline.style.opacity = "1"
    })

    document.addEventListener("mouseout", () => {
      cursorDot.style.opacity = "0"
      cursorOutline.style.opacity = "0"
    })

    document.addEventListener("mousedown", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(0.7)"
      cursorOutline.style.transform = "translate(-50%, -50%) scale(0.7)"
    })

    document.addEventListener("mouseup", () => {
      cursorDot.style.transform = "translate(-50%, -50%) scale(1)"
      cursorOutline.style.transform = "translate(-50%, -50%) scale(1)"
    })
  }

  // Header scroll behavior
  let lastScrollTop = 0
  const header = document.querySelector(".header")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (backToTopButton) {
      if (scrollTop > 500) {
        backToTopButton.classList.add("visible")
      } else {
        backToTopButton.classList.remove("visible")
      }
    }

    lastScrollTop = scrollTop
  })

  // Back to top button
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  }

  // Mobile menu toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active")
      mobileMenu.classList.toggle("active")
      document.body.classList.toggle("no-scroll")
    })
  }

  // Mobile menu close button
  if (mobileClose) {
    mobileClose.addEventListener("click", () => {
      if (menuToggle && mobileMenu) {
        menuToggle.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.classList.remove("no-scroll")
      }
    })
  }

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (menuToggle && mobileMenu) {
        menuToggle.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.classList.remove("no-scroll")
      }
    })
  })

  // Ensure mobile navigation links maintain active state
  function updateMobileNavActiveState() {
    const currentHash = window.location.hash || "#home"

    mobileNavLinks.forEach((link) => {
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })
  }

  updateMobileNavActiveState()
  window.addEventListener("hashchange", updateMobileNavActiveState)

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]")

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight
      const sectionTop = section.offsetTop - 100
      const sectionId = section.getAttribute("id")

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active")
          }
        })

        mobileNavLinks.forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active")
            localStorage.setItem("activeSection", sectionId)
          }
        })
      }
    })
  }

  window.addEventListener("scroll", highlightNavOnScroll)

  // Theme toggle (both desktop and mobile)
  function toggleTheme() {
    document.body.classList.toggle("dark-theme")

    if (document.body.classList.contains("dark-theme")) {
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-sun"></i><span>Tema Chiaro</span>'
      localStorage.setItem("theme", "dark")
    } else {
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-moon"></i><span>Tema Scuro</span>'
      localStorage.setItem("theme", "light")
    }
  }

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme)
  if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme)

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-sun"></i><span>Tema Chiaro</span>'
  } else {
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    if (themeToggleMobile) themeToggleMobile.innerHTML = '<i class="fas fa-moon"></i><span>Tema Scuro</span>'
  }

  // Load categories and projects data
  async function loadData() {
    try {
      const response = await fetch("JS/Categories.json")
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error loading data:", error)
      return null
    }
  }

  // Initialize the application
  async function init() {
    const data = await loadData()
    if (!data) return

    categoriesData = data.categories

    renderCategories(categoriesData)
    renderCategoryNavigation(categoriesData)
    updateCounters(categoriesData)
    setupEventListeners(data)

    const currentHash = window.location.hash || "#home"

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active")
      }
    })

    mobileNavLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active")
      }
    })

    if (!window.location.hash) {
      window.location.hash = "#home"
    }
  }

  // Update counters
  function updateCounters(categories) {
    const categoryCount = Object.keys(categories).length
    let totalProjects = 0

    Object.values(categories).forEach((categoryData) => {
      totalProjects += categoryData.projects.length
    })

    if (categoriesCount) categoriesCount.textContent = "0"
    if (projectsCount) projectsCount.textContent = "0"

    if (categoriesCount) animateCounter(categoriesCount, 0, categoryCount, 1500)
    if (projectsCount) animateCounter(projectsCount, 0, totalProjects, 2000)
  }

  // Animate counter
  function animateCounter(element, start, end, duration) {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const value = Math.floor(progress * (end - start) + start)
      element.textContent = value
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        element.textContent = end
      }
    }
    window.requestAnimationFrame(step)
  }

  // Render category navigation
  function renderCategoryNavigation(categories) {
    if (!categoryNavContainer) return

    categoryNavContainer.innerHTML = ""

    Object.keys(categories)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")))
      .forEach((categoryName) => {
        const displayName = categoryName.replace(/_/g, " ")

        const categoryNavItem = document.createElement("div")
        categoryNavItem.className = "category-nav-item"
        categoryNavItem.dataset.category = categoryName
        categoryNavItem.textContent = displayName

        categoryNavItem.addEventListener("click", function () {
          const categoryData = categories[categoryName]
          if (categoryData && categoryData.projects) {
            renderProjects(categoryName, categoryData.projects)
            if (projectSearchInput) projectSearchInput.value = ""

            document.querySelectorAll(".category-nav-item").forEach((item) => {
              item.classList.remove("active")
            })
            this.classList.add("active")
          }
        })

        categoryNavContainer.appendChild(categoryNavItem)
      })
  }

  // Render category cards (sorted alphabetically)
  function renderCategories(categories) {
    if (!categoriesGrid) return

    categoriesGrid.innerHTML = ""

    Object.keys(categories)
      .sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " ")))
      .forEach((categoryName, index) => {
        const displayName = categoryName.replace(/_/g, " ")
        const categoryData = categories[categoryName]
        const iconClass = categoryData.icon || "fa-folder"

        const categoryCard = document.createElement("div")
        categoryCard.className = "category-card"
        categoryCard.dataset.category = categoryName
        categoryCard.style.animationDelay = `${index * 0.1}s`

        categoryCard.innerHTML = `
          <div class="category-card-content">
            <i class="fas ${iconClass} category-icon"></i>
            <h3>${displayName}</h3>
            <p>${categoryData.projects.length} ${categoryData.projects.length === 1 ? "Progetto" : "Progetti"}</p>
          </div>
        `

        categoriesGrid.appendChild(categoryCard)
      })
  }

  // Render projects for a specific category (sorted alphabetically)
  function renderProjects(categoryName, projects) {
    if (!projectsGrid || !categoryTitle) return

    projectsGrid.innerHTML = ""
    categoryTitle.textContent = categoryName.replace(/_/g, " ")

    if (noProjectsFound) noProjectsFound.style.display = "none"

    projects
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((project, index) => {
        const projectCard = document.createElement("div")
        projectCard.className = "project-card"
        projectCard.dataset.name = project.name.toLowerCase()
        projectCard.style.animationDelay = `${index * 0.1}s`

        projectCard.style.cursor = "pointer"
        projectCard.addEventListener("click", (e) => {
          if (!e.target.closest(".project-link")) {
            window.open(project.link, "_blank")
          }
        })

        projectCard.innerHTML = `
          <div class="project-card-content">
            <h3>${project.name}</h3>
            <div class="project-card-footer">
              <a href="${project.link}" 
                 target="_blank" 
                 class="project-link direct-link"
                 onclick="event.stopPropagation();">
                <i class="fas fa-external-link-alt mr-2"></i> Visita Progetto
              </a>
            </div>
          </div>
        `

        projectsGrid.appendChild(projectCard)
      })

    if (projectsSection) {
      projectsSection.style.display = "block"
      setTimeout(() => {
        projectsSection.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  // Filter categories based on search input
  function filterCategories(searchTerm) {
    const categoryCards = document.querySelectorAll(".category-card")
    let visibleCount = 0

    categoryCards.forEach((card) => {
      const categoryName = card.dataset.category.toLowerCase().replace(/_/g, " ")

      if (categoryName.includes(searchTerm.toLowerCase())) {
        card.style.display = ""
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    const categoryNavItems = document.querySelectorAll(".category-nav-item")
    categoryNavItems.forEach((item) => {
      const categoryName = item.dataset.category.toLowerCase().replace(/_/g, " ")

      if (categoryName.includes(searchTerm.toLowerCase())) {
        item.style.display = ""
      } else {
        item.style.display = "none"
      }
    })

    if (noCategoriesFound) {
      noCategoriesFound.style.display = visibleCount === 0 ? "block" : "none"
    }
  }

  // Filter projects based on search input
  function filterProjects(searchTerm) {
    const projectCards = document.querySelectorAll(".project-card")
    let visibleCount = 0

    projectCards.forEach((card) => {
      const projectName = card.dataset.name

      if (projectName.includes(searchTerm.toLowerCase())) {
        card.style.display = ""
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    if (noProjectsFound) {
      noProjectsFound.style.display = visibleCount === 0 ? "block" : "none"
    }
  }

  // Setup event listeners
  function setupEventListeners(data) {
    if (categoriesGrid) {
      categoriesGrid.addEventListener("click", (e) => {
        const categoryCard = e.target.closest(".category-card")
        if (!categoryCard) return

        const categoryName = categoryCard.dataset.category
        const categoryData = data.categories[categoryName]

        if (categoryData && categoryData.projects) {
          renderProjects(categoryName, categoryData.projects)
          if (projectSearchInput) projectSearchInput.value = ""

          document.querySelectorAll(".category-nav-item").forEach((item) => {
            item.classList.remove("active")
            if (item.dataset.category === categoryName) {
              item.classList.add("active")
            }
          })
        }
      })
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        if (projectsSection) projectsSection.style.display = "none"
        const categoriesSection = document.querySelector(".categories")
        if (categoriesSection) {
          window.scrollTo({
            top: categoriesSection.offsetTop - 80,
            behavior: "smooth",
          })
        }
      })
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        filterCategories(this.value)
      })
    }

    if (projectSearchInput) {
      projectSearchInput.addEventListener("input", function () {
        filterProjects(this.value)
      })
    }

    const scrollDownArrow = document.querySelector(".scroll-down-arrow a")
    if (scrollDownArrow) {
      scrollDownArrow.addEventListener("click", (e) => {
        e.preventDefault()
        const categoriesSection = document.getElementById("categories")
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ behavior: "smooth" })
        }
      })
    }

    if (categoryNavContainer) {
      categoryNavContainer.addEventListener("wheel", function (e) {
        if (e.deltaY !== 0) {
          e.preventDefault()
          this.scrollLeft += e.deltaY
        }
      })
    }
  }

  // Contact functions
  window.contactEmail = (email, subject) => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(`Info sul sito ${subject}`)}`
    window.location.href = mailtoLink
  }

  window.contactCell = () => (window.location.href = "tel:+393337024320")

  window.openWhatsAppChat = () => {
    const phoneNumber = "+393337024320"
    const message = encodeURIComponent("*Info su Pagina Generale Siti*")
    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`
  }

  // Initialize the app
  init()
})
