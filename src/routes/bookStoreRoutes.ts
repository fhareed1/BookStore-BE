import express, { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = express.Router();

// To GET books /books
router.get("/", async (req: Request, res: Response) => {
  try {
    const book = await prisma.book.findMany({
      where: { published: false },
    });

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// To Add new book POST /books
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image, price, year } = req.body;

    if (!req.userId) {
      return res.status(500).json({ error: "User not authenticated" });
    }

    const book = await prisma.book.create({
      data: {
        title,
        description,
        image,
        authorId: parseInt(req.userId),
        price: price.toString(), // Ensure price is a string
        year: typeof year === "string" ? parseInt(year, 10) : year,
      },
    });

    console.log("Book created successfully:", book.id);
    res.json(book);
  } catch (error) {
    console.error("Error creating book:", error);
    // Improved error handling
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
});

// To Get book details GET /books/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(id),
      },
      include: { author: true },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, image, price } = req.body;
    const { id } = req.params;

    const book = await prisma.book.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        description,
        image,
        price: price.toString(), // Ensure price is a string
      },
    });
    res.json(book)
  } catch (error) {
    res.status(500).json({ message: "Editing book Failed" })
  }
});

// To Delete book DELETE /books/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch the book first to check ownership
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if the logged-in user is the author
    if (book.authorId !== parseInt(req.userId)) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this book" });
    }

    await prisma.book.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to Delete book" });
  }
});

export default router;
