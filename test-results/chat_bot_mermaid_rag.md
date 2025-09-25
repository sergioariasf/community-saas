flowchart TD
subgraph subGraph0["🎛️ Granular Control"]
R1["ingesta: force/cache/skip"]
R2["chunking: force/cache/skip"]
R3["embedding: force/cache/skip"]
R4["storage: force/append/cache/skip"]
R5["retrieval: hybrid_rrf/semantic_only/keyword_only"]
R6["top_k: 1-10"]
R7["preguntas: y/n"]
R8["steps: y/n pause mode"]
R9["🆕 schema: actas/contratos/facturas"]
end
subgraph subGraph1["📁 Cache & Config"]
S1["INGESTED_CACHE/*.json"]
S2["CHUNKING_CACHE/hierarchical_chunks_multi_doc_*.json"]
S3["embedding_cache/*.pkl"]
S4["bm25_cache/bm25_index.pkl"]
S5["chroma_db_interactive_test_v3_granular/"]
S6["🆕 config/schemas/<br>• actas_schema.json<br>• contratos_schema.json<br>•
facturas_schema.json"]
end
subgraph subGraph2["🧪 Testing Files"]
T1["TEST_MANUAL/test_end_to_end_interactive_v3.py"]
T2["TEST_MANUAL/bateria_preguntas.py"]
T3["TEST_MANUAL/results/pipeline_results/"]
end
subgraph subGraph3["📋 Dynamic Schema-Based Metadata"]
MD1["📄 Document Level<br>🆕 Loaded from schema.json<br>• required_metadata<br>•
domain-specific fields"]
MD2["✂️ Chunk Level<br>🆕 Schema-driven extraction<br>• chunk_type, categories<br>•
indexable_fields"]
MD3["🏷️ Category Filters<br>🆕 Dynamic from schema<br>• categories list<br>•
search_filters"]
MD4["🆕 core/interfaces/<br>• metadata_contract.py ✅<br>• document_schemas.py 🆕<br>•
DocumentSchemaLoader 🆕"]
end
A["📄 PDF Documents<br>DATASET/actas/"] --> B{"🔧 FASE 1: INGESTA"}
B -- force/cache/skip --> C["IngestionModule<br>core/ingestion/"]
C --> C1["📥 PyMuPDF Extractor"]
C1 --> C2{"OCR Needed?"}
C2 -- Yes --> C3["🔍 Google Vision API<br>credentials/beltran-*.json"]
C2 -- No --> C4["Extract Text"]
C3 --> C4
C4 --> C5["💾 Cache to<br>INGESTED_CACHE/"]
C5 --> D{"✂️ FASE 2: CHUNKING"}
D -- force/cache/skip --> E["ChunkingModule<br>core/chunking/"]
E --> E0["🆕 DocumentSchemaLoader<br>Load schema for doc_type"]
E0 --> E1{"Strategy?"}
E1 -- hierarchical*cache --> E2["📁 Load
from<br>CHUNKING_CACHE/hierarchical_chunks*_.json"]
E1 -- hierarchical --> E3["🤖 hierarchical_preprocessor.py<br>🆕 + schema-driven metadata"]
E1 -- fixed*size --> E4["📏 Fixed Size Strategy<br>500 chars chunks"]
E3 --> E3a["🧠 Gemini Flash Analysis<br>🆕 Uses schema.gemini_prompt"]
E3a --> E3b["📋 Extract Schema Metadata<br>🆕 Dynamic fields from schema<br>•
required_metadata<br>• categories list<br>• domain fields"]
E3b --> E3c["📍 Identify Chapter Positions<br>🆕 Schema-based categories<br>• title,
category<br>• start/end positions"]
E3c --> E3d["✂️ Generate Chunks<br>🆕 StandardMetadata.from_schema()"]
E3d --> E3d1["📄 Document Overview Chunk<br>🆕 Schema-driven summary<br>• Dynamic metadata
fields<br>• chunk_type: overview"] & E3d2["📝 Content Chunks by Categories<br>🆕 Schema
categories<br>• Position metadata<br>• chunk_type: content_chunk"]
E3d1 --> E3e["💾 Save to<br>CHUNKING_CACHE/hierarchical_chunks_multi_doc*_.json"]
E3d2 --> E3e
E2 --> F{"🔢 FASE 3: EMBEDDING"}
E3e --> F
E4 --> F
F -- force/cache/skip --> G["EmbeddingModule<br>core/embedding/"]
G --> G1["🔤 sentence-transformers<br>all-MiniLM-L6-v2"]
G1 --> G2["🔢 Generate 384-dim vectors"]
G2 --> H{"💾 FASE 4: STORAGE"}
H -- force/append/cache/skip --> I["StorageModule<br>core/storage/"]
I --> I1["🗄️ ChromaDB<br>chroma_db_interactive_test_v3_granular/"]
I1 --> I2["💾 Store vectors + schema metadata<br>🆕 Dynamic fields from schema<br>•
schema.chromadb_indexable_fields<br>• StandardMetadata contract"]
I2 --> J["🔍 Initialize BM25<br>bm25_cache/bm25_index.pkl"]
J --> K{"❓ QUERIES MODE"}
K -- "preguntas=y" --> L["📋 Run Test Queries<br>bateria_preguntas.py"]
K -- "preguntas=n" --> M["💬 Interactive Mode"]
L --> N["QueryProcessingModule<br>core/query_processing/"]
M --> N
N --> N0["🆕 Load Query Schema<br>Available filters from schema"]
N0 --> N1["🤖 Gemini Conversation Manager<br>🆕 Schema-aware filtering<br>• Intent
Classification<br>• Schema validation"]
N1 --> N2["🎯 Generate ChromaDB Filters<br>🆕 StandardMetadata.to_chromadb_filters()<br>•
Dynamic from schema<br>• Validated fields only"]
N2 --> O["RetrievalModule<br>core/retrieval/"]
O --> O1{"Retrieval Strategy"}
O1 -- hybrid_rrf --> O2["🔄 Hybrid Search<br>70% semantic + 30% BM25<br>+ Schema-based
filters"]
O1 -- semantic_only --> O3["🔍 Vector Similarity Only<br>+ Schema-based filters"]
O1 -- keyword_only --> O4["📝 BM25 Keyword Only<br>+ Post-search filtering"]
O2 --> P["GenerationModule<br>core/generation/"]
O3 --> P
O4 --> P
P --> P1["🤖 Gemini 1.5 Flash<br>Generate Response"]
P1 --> Q["📤 Final Response<br>+ Citations + Scores + Sources"]

      classDef moduleStyle fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
      classDef phaseStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
      classDef cacheStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
      classDef controlStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px
      classDef preprocessorStyle fill:#fff8e1,stroke:#ff8f00,stroke-width:3px
      classDef metadataStyle fill:#f1f8e9,stroke:#689f38,stroke-width:2px
      classDef newFeatureStyle fill:#ffebee,stroke:#c62828,stroke-width:3px

      R9:::newFeatureStyle
      S6:::newFeatureStyle
      MD4:::newFeatureStyle
      E0:::newFeatureStyle
      E3a:::newFeatureStyle
      E3b:::newFeatureStyle
      E3d:::newFeatureStyle
      N0:::newFeatureStyle
      N1:::newFeatureStyle
      N2:::newFeatureStyle
