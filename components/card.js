<script>
class SimpleCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const title = this.getAttribute("title") || "";
    const image = this.getAttribute("image") || "";
    const text = this.getAttribute("text") || "";
    const link = this.getAttribute("link") || "#";

    shadow.innerHTML = `
      <style>
        .card {
          font-family: system-ui, sans-serif;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
          background: white;
          max-width: 320px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
        }

        img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .content {
          padding: 16px;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 1.2rem;
        }

        p {
          margin: 0 0 14px;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        a {
          text-decoration: none;
          background: black;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
        }
      </style>

      <div class="card">
        ${image ? `<img src="${image}" alt="">` : ""}
        <div class="content">
          <h3>${title}</h3>
          <p>${text}</p>
          <a href="${link}">
            <slot name="button">Read more</slot>
          </a>
        </div>
      </div>
    `;
  }
}

customElements.define("simple-card", SimpleCard);
</script>