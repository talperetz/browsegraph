<div align="center">
<div>
  <a href="https://browsegraph.com/">
    <img src="./src/assets/browsegraph-logo.svg" alt="BrowseGraph Logo" />
  </a>
</div>
  
<p align="center">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=plastic&logo=github&logoColor=white&cacheSeconds=60">
    <img alt="Version" src="https://img.shields.io/badge/Version-0.1.0-blue?style=plastic&logo=github&logoColor=white&cacheSeconds=60">
    <img alt="Chrome Version" src="https://img.shields.io/badge/Chrome-133%2B-orange?style=plastic&logo=google-chrome&logoColor=white&cacheSeconds=60">
</p>
   Everything you browse, fully connected and always accessible. </br>
   BrowseGraph is the first implementation of a local-first GraphRAG.
</div>

<p align="center">
  <ahref="https://browsegraph.com/">
   <img alt="BrowseGraph" width=600 src="https://github.com/user-attachments/assets/c276737f-a017-4e6c-bfaf-c0a462295450"/>
  </a>
</p>


## ⚡ Getting Started

1. **Install BrowseGraph**  
   Add BrowseGraph to your Chrome browser with a single click. No complicated setups.

2. **Start Browsing**  
   BrowseGraph works silently in the background, connecting every page you visit into a dynamic visual network.

3. **Search and Ask**  
   Access all your knowledge seamlessly. Instantly search, navigate, and discover information whenever you need it.



## 🌟 Features

- **Local-First Processing**: All AI computations are performed locally within your browser using in-browser LLMs.
- **Dynamic Knowledge Graphing**: Automatically capture and organize everything you browse into a visual knowledge network.
- **Smart Content Filtering**: Filters out irrelevant pages based on your interests.
- **Efficient Summarization**: Summarizes and indexes page content for quick access.
- **Graph-Based Insights**: Creates and stores graph data to enhance content recommendations.
- **Blazingly Fast Retrieval**: Retrieve any piece of your browsed content instantly with powerful search and intuitive navigation.


![CleanShot 2024-11-28 at 11 42 53](https://github.com/user-attachments/assets/01280850-0efb-4afc-ab7c-4163e6cd96a7)

## 🧩 How It Works

```mermaid
sequenceDiagram
    %% Participants
    participant Extension as Chrome Extension
    participant Personalizer as User Content Personalizer<br/>(Local LLM)
    participant Classifier as Page Classifier<br/>(Local LLM)
    participant Summarizer as Page Summarizer<br/>(Local LLM)
    participant CloudLLM as Page-Graph-Transformer<br/>(Cloud LLM)
    participant Database as Local Database

    %% User action without a participant node
    Note over Extension: User browses a web page

    %% Sequence of interactions
    Extension ->> Personalizer: Generate User Interests
    Personalizer -->> Extension: User Interests
    Extension ->> Classifier: Classify Page vs. User Interests
    Classifier -->> Extension: Relevance Result (Relevant)

    Extension ->> Summarizer: Chunk and Summarize Content
    Summarizer -->> Extension: Summarized Data
    Extension ->> Database: Index Summarized Data
    Extension ->> CloudLLM: Send Minimal Data
    CloudLLM -->> Extension: Return Graph Data
    Extension ->> Database: Store Graph Data
```

## 🔒 Privacy & Security

- **Data Locality:** All raw data processing occurs within your browser using local LLMs and local vector DB.
- **Minimal Cloud Interaction:** Only non-sensitive, aggregated data is sent to the cloud for graph transformations.
- **No Data Sharing:** Your browsing data is never shared with third parties.

## ⏩ Roadmap

- [ ] **Conversational Interface:** Build an interactive conversational layer to simplify user interactions.
- [ ] **Artifacts UX:** Enable a side-by-side view of chat and graph for seamless exploration.
- [ ] **Bring Your Own Key (BYOK):** Support user-provided keys for LLM providers to offer flexibility and control.
- [ ] **Chrome Web Store Launch:** Officially release BrowseGraph on the Chrome Web Store.

## 🤗 Contributions
Composio is open-source and we welcome contributions. Please fork the repository, create a new branch for your feature, add your feature or improvement, and send a pull request.
