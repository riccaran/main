(function () {
    "use strict";

    var body = document.body;
    var menuButton = document.querySelector(".menu-toggle");
    var navigation = document.querySelector(".nav-links");
    var navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));

    function setMenu(open) {
        if (!menuButton || !navigation) {
            return;
        }

        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        navigation.classList.toggle("is-open", open);
        body.classList.toggle("menu-open", open);
    }

    if (menuButton && navigation) {
        menuButton.addEventListener("click", function () {
            setMenu(menuButton.getAttribute("aria-expanded") !== "true");
        });

        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                setMenu(false);
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
                setMenu(false);
                menuButton.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (menuButton.getAttribute("aria-expanded") === "true" && !event.target.closest(".header-inner")) {
                setMenu(false);
            }
        });

        window.matchMedia("(min-width: 821px)").addEventListener("change", function (event) {
            if (event.matches) {
                setMenu(false);
            }
        });
    }

    var filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    var projectCards = Array.from(document.querySelectorAll(".project-card[data-category]"));
    var projectGrid = document.querySelector(".project-grid");
    var filterStatus = document.querySelector(".filter-status");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var selectedFilter = button.getAttribute("data-filter");
            var visibleCount = 0;

            filterButtons.forEach(function (item) {
                item.setAttribute("aria-pressed", String(item === button));
            });

            projectCards.forEach(function (card) {
                var shouldShow = selectedFilter === "all" || card.getAttribute("data-category") === selectedFilter;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visibleCount += 1;
                    card.classList.add("is-visible");
                }
            });

            if (projectGrid) {
                projectGrid.setAttribute("data-filtered", String(selectedFilter !== "all"));
                projectGrid.setAttribute("data-visible-count", String(visibleCount));
            }

            if (filterStatus) {
                filterStatus.textContent = visibleCount + (visibleCount === 1 ? " project shown" : " projects shown");
            }
        });
    });

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealItems = Array.from(document.querySelectorAll(".reveal"));

    if ("IntersectionObserver" in window && !reducedMotion) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealItems.forEach(function (item) {
            revealObserver.observe(item);
        });
    } else {
        revealItems.forEach(function (item) {
            item.classList.add("is-visible");
        });
    }

    var observedSections = navLinks.map(function (link) {
        return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);

    if ("IntersectionObserver" in window && observedSections.length) {
        var activeSections = new Set();
        var navigationObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    activeSections.add(entry.target.id);
                } else {
                    activeSections.delete(entry.target.id);
                }
            });

            var activeId = observedSections.slice().reverse().find(function (section) {
                return activeSections.has(section.id);
            });

            navLinks.forEach(function (link) {
                var isActive = Boolean(activeId) && link.getAttribute("href") === "#" + activeId.id;
                link.classList.toggle("is-active", isActive);
                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }, {
            rootMargin: "-28% 0px -62% 0px",
            threshold: 0
        });

        observedSections.forEach(function (section) {
            navigationObserver.observe(section);
        });
    }

    var scrollTicking = false;

    function updateScrollProgress() {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
        scrollTicking = false;
    }

    window.addEventListener("scroll", function () {
        if (!scrollTicking) {
            window.requestAnimationFrame(updateScrollProgress);
            scrollTicking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", updateScrollProgress, { passive: true });
    updateScrollProgress();

    var copyButton = document.querySelector(".copy-email");
    var copyStatus = document.querySelector(".copy-status");

    function fallbackCopy(value) {
        var field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        var copied = document.execCommand("copy");
        field.remove();
        return copied;
    }

    if (copyButton) {
        copyButton.addEventListener("click", function () {
            var email = copyButton.getAttribute("data-email");
            var operation = navigator.clipboard && window.isSecureContext
                ? navigator.clipboard.writeText(email).then(function () { return true; })
                : Promise.resolve(fallbackCopy(email));

            operation.then(function (copied) {
                if (copyStatus) {
                    copyStatus.textContent = copied ? "Email copied to clipboard." : "Copy unavailable. Email: " + email;
                }
                if (copied) {
                    copyButton.textContent = "Copied";
                    window.setTimeout(function () {
                        copyButton.textContent = "Copy email";
                    }, 1800);
                }
            }).catch(function () {
                if (copyStatus) {
                    copyStatus.textContent = "Copy unavailable. Email: " + email;
                }
            });
        });
    }

    var yearTarget = document.querySelector("[data-current-year]");
    if (yearTarget) {
        yearTarget.textContent = String(new Date().getFullYear());
    }
}());
