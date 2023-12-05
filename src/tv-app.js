// import stuff
import { LitElement, html, css } from "lit";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "./tv-channel.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "./course-title.js";

export class TvApp extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = "";
    this.source = new URL("../assets/channels.json", import.meta.url).href;
    this.listings = [];
    this.id = "";
    this.contents = Array(9).fill("");
    this.currentPage = 0;
    this.selectedCourse = null;
    this.activeIndex = 0; // To keep track of the active index
    this.activeContent = ""; // To store the active content HTML
    this.upperContent = "";
    this.itemClick = this.itemClick.bind(this);
    this.time = "";
    this.farthestIndex = 0;
  }
/*
  connectedCallback() {
    super.connectedCallback();

    this.contents.forEach((_, index) => {
      this.loadContent(index);
    });
  }
*/
  // convention I enjoy using to define the tag's name
  static get tag() {
    return "tv-app";
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      farthestIndex: { type: Number },
      name: { type: String },
      source: { type: String },
      listings: { type: Array },
      selectedCourse: { type: Object },
      currentPage: { type: Number },
      contents: { type: Array },
      id: { type: String },
      activeIndex: { type: Number },
      activeContent: { type: String },
      time: { type: Number },
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return [
      css`
        :host {
          display: block;
          margin: 16px;
          padding: 16px;
        }

        .alignContent {
          display: flex;
          justify-content: flex-start;
          gap: 90px; /* Optional: adjust the gap between course topics and main content */
        }

        .course-topics {
          margin-left: -36px;
          display: flex;
          flex-direction: column;
          width: 275px;
          margin-right: 1px;
          margin-top: 25px;
          position: fixed;
          padding-top: 8px;
          padding-right: 5px;
        }

        .main {
          margin: 42px 141px 23px 386px;
          padding-top: 8px;
          padding-right: 5px;
          padding-bottom: 1px;
          padding-left: 20px;
          width: calc(100% - 291px);
          height: 100%;
          font-size: 1em;
          border: 1px solid #dadce0;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add box shadow to the right */
          background-color: #f8f9fa; /* Keep the same background color */
          font: 400 16px/24px var(--devsite-primary-font-family);
          -webkit-font-smoothing: antialiased;
          text-size-adjust: 100%;
          color: #4e5256;
          font-family: var(--devsite-primary-font-family);
          background: #f8f9fa;
        }

        .fabs {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          position: fixed;
          bottom: 0;
          right: 0;
          margin: 19px;
          width: 81vw;
        }

        #previous > button {
          border-radius: 4px;
          font-family:
            Google Sans,
            Arial,
            sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.6px;
          line-height: 24px;
          padding-bottom: 6px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 6px;
          pointer-events: auto;
          text-transform: none;
          background: #fff;
          color: #1a73e8;
          border: 0;
          box-shadow:
            0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        #next > button {
          border-radius: 4px;
          font-family:
            Google Sans,
            Arial,
            sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.6px;
          line-height: 24px;
          padding-bottom: 6px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 6px;
          pointer-events: auto;
          text-transform: none;
          background: #1a73e8;
          color: #fff;
          border: 0;
          box-shadow:
            0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12),
            0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
      `,
    ];
  }

  render() {
    return html`
    <body onload = "onLoad()">
      <course-title time = "${this.time}">

      </course-title>
      <div class="alignContent">
        <div class="course-topics">
          ${this.listings.map(
            (item, index) => html`
              <tv-channel
                title="${item.title}"
                presenter="${item.metadata.author}"
                id="${item.id}"
                @click="${() => this.itemClick(index)}"
                activeIndex="${this.activeIndex}"
              >
              </tv-channel>
            `,
          )}
        </div>

        <div class="upper-main">

        </div>
        <div class="main">
          ${this.activeContent ? unsafeHTML(this.activeContent) : html``}
        </div>
        <div class="fabs">
          <div id="previous">
            <button @click=${() => this.prevPage()}>Back</button>
          </div>
          <div id="next">
            <button @click=${() => this.nextPage()}>Next</button>
          </div>
        </div>
      </div>
      <body>
    `;
  }
  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector(".dialog");
    dialog.hide();
  }

  // async progressionBar(activeIndex) {
  //   console.log("Progress", progress)
  //   const progressValue = this.shadowRoot.querySelector(".progress-value");
  //   const progressText = this.shadowRoot.querySelector(".progress-text");

  //   progressValue.style.width = `${(activeIndex + 1) * 10}%`;
  //   progressText.innerHTML = `${activeIndex + 1} / ${this.listings.length}`;

  // }

loadState() {
  const storedActiveIndex = localStorage.getItem('activeIndex');
  const storedFarthestIndex = localStorage.getItem('farthestIndex');
  if (storedActiveIndex !== null && storedFarthestIndex !== null) {
    this.activeIndex = parseInt(storedActiveIndex, 10);
    this.farthestIndex = parseInt(storedFarthestIndex, 10);
    this.loadActiveContent();
  }
}

connectedCallback() {
  super.connectedCallback();
  this.loadData();
  this.loadState(); // Load the stored state on page load
}

saveState() {
  if (this.farthestIndex == this.listings.length-1){
    localStorage.clear();
    this.activeIndex = 0;
    this.farthestIndex = this.activeIndex;
    localStorage.setItem('activeIndex', this.activeIndex);
    localStorage.setItem('farthestIndex', this.farthestIndex);
  }
  localStorage.setItem('activeIndex', this.activeIndex);
  localStorage.setItem('farthestIndex', this.farthestIndex);
}

  async loadData() {
    // Fetch data from the source
    await fetch(this.source)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((responseData) => {
        if (
          responseData.status === 200 &&
          responseData.data.items &&
          responseData.data.items.length > 0
        ) {
          this.listings = [...responseData.data.items];
          this.loadActiveContent();
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  loadActiveContent() {
    if (this.listings && this.listings.length > 0 && this.activeIndex >= 0 && this.activeIndex < this.listings.length) {
      const item = this.listings[this.activeIndex].location;
      const contentPath = "/assets/" + item;

      fetch(contentPath)
        .then((response) => response.text())
        .then((text) => {
          this.activeContent = text;
          this.time = this.listings[this.activeIndex].metadata.timecode;
        })
        .catch((error) => {
          console.error('Error fetching active content:', error);
        });
    }
  }

  async nextPage() {
    if (this.activeIndex != this.listings.length-1){
      if (this.activeIndex !== null) {
        const nextIndex = (this.activeIndex + 1) % this.listings.length;
        const item = this.listings[nextIndex].location;

        const contentPath = "/assets/" + item;

        try {
          const response = await fetch(contentPath);
          this.activeContent = await response.text();
          // console.log("Active Content", this.activeContent);
          this.activeIndex = nextIndex; // Update the active index after fetching content
          this.time = this.listings[nextIndex].metadata.timecode;
        } catch (err) {
          console.log("fetch failed", err);
        }
      }
    }
  }

  async prevPage() {
    if (this.activeIndex != 0){
      if (this.activeIndex !== null) {
        const prevIndex =
          this.activeIndex === 0
            ? this.listings.length - 1
            : this.activeIndex - 1;
        const item = this.listings[prevIndex].location;

        const contentPath = "/assets/" + item;

        try {
          const response = await fetch(contentPath);
          this.activeContent = await response.text();
          // console.log("Active Content", this.activeContent);
          this.activeIndex = prevIndex; // Update the active index after fetching content
          this.time = this.listings[prevIndex].metadata.timecode;
        } catch (err) {
          console.log("fetch failed", err);
        }
      }
    }
  }

  async itemClick(index) {
    if (index <= this.farthestIndex + 1) {
      this.activeIndex = index;
      const item = this.listings[index].location;
      this.time = this.listings[index].metadata.timecode;
      const contentPath = "/assets/" + item;

      try {
        const response = await fetch(contentPath);
        const text = await response.text();
        this.activeContent = text;
        if (index > this.farthestIndex) {
          this.farthestIndex = index;
        }
        this.saveState();
      } catch (err) {
        console.log("fetch failed", err);
      }
    } else {
      console.log("You can only click back to the immediate previous or current element.");
      // Handle clicks beyond the farthest index clicked
    }
  }


  firstUpdate(){
    this.activeIndex = 0;
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  async updateSourceData(source) {
    await fetch(source)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((responseData) => {
        if (
          responseData.status === 200 &&
          responseData.data.items &&
          responseData.data.items.length > 0
        ) {
          this.listings = [...responseData.data.items];
          // console.log("Listings", this.listings);
          console.log("TimeCOde", this.listings);
        }
      });
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(TvApp.tag, TvApp);
