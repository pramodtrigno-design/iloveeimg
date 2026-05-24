import mongoose, { Schema, model, models, Model } from "mongoose";

export interface IBlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: string;
    category: string;
    tags: string[];
    readingTime: number;
    publishedAt: Date;
    updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        coverImage: { type: String, default: "/blog/default-cover.jpg" },
        author: { type: String, default: "iLoveIMG Team" },
        category: { type: String, default: "General" },
        tags: { type: [String], default: [] },
        readingTime: { type: Number, default: 1 },
        publishedAt: { type: Date, default: () => new Date() },
    },
    { timestamps: { createdAt: false, updatedAt: true } }
);

export const BlogPostModel: Model<IBlogPost> =
    (models.BlogPost as Model<IBlogPost>) || model<IBlogPost>("BlogPost", BlogPostSchema);

export type BlogPostDoc = mongoose.HydratedDocument<IBlogPost>;
