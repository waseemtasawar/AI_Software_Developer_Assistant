const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalFileName: {
      type: String,
    },

    totalFiles: {
      type: Number,
      default: 0,
    },

    analysisStatus: {
      type: String,
      enum: ["not_started", "processing", "completed", "failed"],
      default: "not_started",
    },

    analysisError: {
      type: String,
      default: null,
    },

    analysis: {
      primaryLanguage: {
        type: String,
        default: "Unknown",
      },

      languages: [
        {
          name: String,
          files: Number,
          percentage: Number,
        },
      ],

      frontend: {
        type: String,
        default: "Not detected",
      },

      backend: {
        type: String,
        default: "Not detected",
      },

      framework: {
        type: String,
        default: "Not detected",
      },

      database: {
        type: String,
        default: "Not detected",
      },

      packageManager: {
        type: String,
        default: "Not detected",
      },

      dependencies: {
        type: [String],
        default: [],
      },

      devDependencies: {
        type: [String],
        default: [],
      },

      statistics: {
        totalFiles: {
          type: Number,
          default: 0,
        },

        codeFiles: {
          type: Number,
          default: 0,
        },

        totalLines: {
          type: Number,
          default: 0,
        },

        totalFolders: {
          type: Number,
          default: 0,
        },
      },

      folderTree: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },

    // chunking
    chunkingStatus: {
  type: String,
  enum: ["not_started", "processing", "completed", "failed"],
  default: "not_started",
},

chunkingError: {
  type: String,
  default: null,
},

chunkingStats: {
  totalChunks: {
    type: Number,
    default: 0,
  },

  chunkedFiles: {
    type: Number,
    default: 0,
  },

  skippedFiles: {
    type: Number,
    default: 0,
  },

  totalCharacters: {
    type: Number,
    default: 0,
  },

  estimatedTokens: {
    type: Number,
    default: 0,
  },

  chunkedAt: {
    type: Date,
    default: null,
  },
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);