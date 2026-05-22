import { NextRequest, NextResponse } from "next/server";
import { updatePost, deletePost } from "@/lib/blog";
import { isAuthenticated } from "@/lib/auth";
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { slug } = params;

    const body = await request.json();

    const {
      slug: newSlug,
      title,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
    } = body;

    const post = updatePost(slug, {
      slug: newSlug,
      title,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
    });

    return NextResponse.json(
      { success: true, post },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to update blog post." },
      { status: 500 }
    );
  }
}
// export async function PUT(
//     request: NextRequest,
//     { params }: { params: Promise<{ slug: string }> }
// ) {
//     if (!(await isAuthenticated())) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const { slug } = await params;
//         const body = await request.json();

//         const { slug: newSlug, title, excerpt, content, coverImage, author, category, tags } = body;

//         if (!title || !content || !excerpt) {
//             return NextResponse.json(
//                 { error: "Title, excerpt, and content are required." },
//                 { status: 400 }
//             );
//         }

//         const post = updatePost(slug, {
//             slug: newSlug,
//             title,
//             excerpt,
//             content,
//             coverImage: coverImage || "/blog/default-cover.jpg",
//             author: author || "iLoveIMG Team",
//             category: category || "General",
//             tags: tags || [],
//         });

//         if (!post) {
//             return NextResponse.json({ error: "Post not found." }, { status: 404 });
//         }

//         return NextResponse.json({ success: true, post }, { status: 200 });
//     } catch (error) {
//         console.error("Error updating blog post:", error);
//         return NextResponse.json(
//             { error: "Failed to update blog post." },
//             { status: 500 }
//         );
//     }
// }

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { slug } = await params;
        const success = deletePost(slug);

        if (!success) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json(
            { error: "Failed to delete blog post." },
            { status: 500 }
        );
    }
}
