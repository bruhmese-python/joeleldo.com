(function () {
  if (
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    const sidebar = document.querySelector(".site-container");
    // if (sidebar) sidebar.innerHTML = '';
    if (sidebar) {
      sidebar.style.width = "auto";
    }
  }
})();

// Wait for the document to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Select all span elements with the class 'Bullet_20_Symbols'
  const spans = document.querySelectorAll("span.Bullet_20_Symbols");

  // Loop through each span and remove it from the DOM
  spans.forEach((span) => {
    span.remove();
  });

  const tr_paras = document.querySelectorAll(".paragraph-Table_20_Contents");

  tr_paras.forEach((para) => {
    const parent = para.parentElement; // Get the parent of the <tr> element
    const paraHTML = para.innerHTML; // Get the inner HTML of the <tr> element

    para.remove(); // Remove the <tr> element from the DOM

    parent.innerHTML += paraHTML; // Append the inner HTML of <tr> to the parent element
  });

  const images = document.querySelectorAll(".article-container img"); // Select all <img> tags within #article-container

  images.forEach((img) => {
    img.classList.add("modal_img"); // Add 'modal_img' class to each image
  });

  // Create a table of contents
  // This will create a list of all headings (h2, h3) in the document
  // and link them to their respective sections.
  const headings = document.querySelectorAll("h2, h3");
  const toc = document.getElementById("toc");

  if (!toc) {
    console.warn("No element with ID 'table-of-contents' found.");
    return;
  }

  const tocList = document.createElement("ul");

  headings.forEach((heading, index) => {
    let id = heading.id;

    // If the heading doesn't have an ID, generate one
    if (!id) {
      id =
        heading.textContent
          .toLowerCase()
          .trim()
          .replace(/[^\w]+/g, "-")
          .replace(/^-+|-+$/g, "") +
        "-" +
        index;
      heading.id = id;
    }

    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = heading.textContent;

    const listItem = document.createElement("li");
    listItem.appendChild(link);

    // Add class for h3 to style indents, etc.
    if (heading.tagName.toLowerCase() === "h3") {
      listItem.classList.add("toc-nested-list-item");
    }

    tocList.appendChild(listItem);
  });

  toc.appendChild(tocList);

  // Select all divs with id starting with "Text_Frame"
  const divs = document.querySelectorAll('div[id^="Text_Frame"]');

  divs.forEach((div) => {
    // Remove inline styles
    div.removeAttribute("style");
  });

  // Grey out download document link if href is '#'
  const link = document.getElementById("download-doc-link");

  if (link.getAttribute("href") === "#") {
    link.style.color = "grey";
    link.style.pointerEvents = "none"; // optional: disable click
    link.style.textDecoration = "none"; // optional: remove underline
  }

  // Change background color of certain spans from #FFF0F0 to #510101
  const targetSpans = document.querySelectorAll(
    'span[style*="background-color: #FFF0F0"]'
  );
  targetSpans.forEach((span) => {
    span.style.backgroundColor = "#510101";
  });
});
