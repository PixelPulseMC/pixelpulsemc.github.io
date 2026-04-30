async function loadPosts() {
  const res = await fetch("posts.json");
  const data = await res.json();

  render("announcements-list", data.announcements);
  render("blog-list", data.blog);
  render("changelog-list", data.changelog);
}

function render(id, items) {
  const container = document.getElementById(id);

  container.innerHTML = items.map(p => `
    <div class="post">
      <strong>${p.title}</strong><br>
      <small>${p.date}</small>
      <p>${p.content}</p>
    </div>
  `).join("");
}

loadPosts();
