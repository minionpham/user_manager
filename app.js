// app.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/UserRoutes");
const multer = require("multer");
const Image = require("./models/Image")
const path = require("path")

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);

// upload image

app.use(express.static("uploads"))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ "-" + file.originalname)
    }
})

const upload = multer(
    {
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
              cb(null, true);
            } else {
              cb(null, false);
              return cb(new Error('Only .png, .jpg and .jpeg formats are allowed!'));
            }
        },
    }
)

app.post('/single', upload.single("image"), async (req, res) => {
    try {
        const { path, filename } = req.file;
        const image = await Image({path, filename})
        await image.save();
        res.send({"msg": "Image Uploaded", "id": image._id})
    } catch (error){
        res.send({"error": "Unable to upload image"})
    }
    console.log(req.file);
})

app.get("/img/:id", async (req, res) => {
    const {id} = req.params
    try {
        const image = await Image.findById(id)
        if(!image) res.send({"msg": "Image not found"})

        const imagePath = path.join(__dirname, "uploads", image.filename)
        res.sendFile(imagePath)
    } catch (error) {
        res.send({"error": "unable to save image"})
    }
})


// MongoDB connection
const MONGODB_URI = "mongodb+srv://Hung:hung20210406@hung-cluster.cniof.mongodb.net/?retryWrites=true&w=majority&appName=Hung-Cluster";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected."))
    .catch(err => console.log("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
    const runningHost = process.env.RENDER_EXTERNAL_URL; 
    console.log(`Server is running on ${runningHost}`);
});
