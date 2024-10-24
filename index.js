const express = require('express');
const { PrismaClient } = require("@prisma/client");
// const { userRoute } = require('./routes/userRoutes');
const prisma = new PrismaClient();
require("dotenv").config();
const app = express();
app.use(express.json());
// app.use(userRoute);

app.post("/post", async (req, res) => {
    try {
      const { username, email, name, posts } = req.body;
      
      if (!username || !email || !name || !posts || posts.length === 0) {
        return res.status(400).json({ message: "Please provide all required fields including posts" });
      }
  
      const user = await prisma.user.create({
        data: {
          username,
          email,
          name,
          posts: {
            create: posts.map((post) => ({
              title: post.title,
              content: post.content,
            })),
          },
        },
        include: { posts: true }
      });
  
      return res.status(201).json({ message: "User with posts created successfully", data: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something broke!" });
    }
  });

  app.get("/get/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { posts: true } // Include posts in the response
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching user with posts" });
    }
  });

  app.post("/post/:userId", async (req, res) => {
    const {userId } = req.params;
    const { title, content } = req.body;

    try {
      const findUserData = await prisma.user.findFirst({where:{id:Number(userId)}})
      console.log(findUserData," : : findUserData")
      if(!findUserData){
        return res.status(404).json({ message: "user not found" });
      }
      
      const updatedPost = await prisma.post.create({
        data: {
          title,
          content,
          userId:Number(userId)
        },
      });
     
      return res.json({ message: "Post Created successfully", data: updatedPost });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creation post" });
    }
  });

  app.put("/put/:userId/:postId", async (req, res) => {
    const { userId, postId } = req.params;
    const { title, content } = req.body;
  
    try {
      const findUserData = await prisma.user.findFirst({ where: { id: Number(userId) } });
      if (!findUserData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const findPost = await prisma.post.findFirst({
        where: { id: Number(postId), userId: Number(userId) }
      });
  
      const updatedPost = await prisma.post.update({
        where: { id: Number(postId) },
        data: {
          title,
          content
        }
      });
  
      return res.json({ message: "Post updated successfully", data: updatedPost });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating post" });
    }
  });
  
  
  app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: parseInt(id) },
        include: { posts: true } // This will delete the user and their posts
      });
  
      return res.json({ message: "User and their posts deleted successfully", data: deletedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting user and posts" });
    }
  });
  // Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
  