import { Axios } from "../../../Api/Axios";
import { useEffect, useRef, useState } from "react"
import { CAT, Pro } from "../../../Api/Api";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../../../Components/Loading/Loading";
import "../Dashboard.css"
export default function EditProduct() {

    const [form, setForm] = useState({
        category: "",
        title: "",
        description: "",
        price: "",
        discount: "",
        About: ""
    });
    const { id } = useParams();
    const [images, setImages] = useState([]);
    const [imagesFromServer, setImagesFromServer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idsFromServer, setIdsFromServer] = useState([]);
    console.log(idsFromServer)
    // const [id, setId] = useState();
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    // useRef for Input[Focus]
    const focus = useRef("");
    const openInputFile = useRef(null);
    const progress = useRef([]);
    // get id-image
    const imageIds = useRef([]);



    // Use [UseRef]
    useEffect(() => {
        focus.current.focus();
    }, [])

    // get all categories
    useEffect(() => {
        Axios.get(`/${CAT}`)
            .then((data) => setCategories(data.data))
            .catch((err) => console.log(err));

    }, [])
    //get data from product table
    useEffect(() => {
        Axios.get(`/${Pro}/${id}`)
            .then((data) => {
                setForm(data.data[0]);
                setImagesFromServer(data.data[0].images)
            })

            .catch((err) => console.log(err));

    }, [])
    //Mapping
    const getCategories = categories.map((cat, key) => (
        <option key={key} value={cat.id}>{cat.title}</option>
    ))
    const imagesShowFromServer = imagesFromServer.map((img, key) => (
        <div className="border p-3 relative">
            <div key={key} className="">
                <img src={img.image} alt="" style={{ maxWidth: "100px", borderRadius: "4px", maxHeight: "100px", height: "100px", width: "100px" }} />
                <i className="fa-regular fa-rectangle-xmark absolute text-highlight cursor-pointer" style={{ top: "-5px", right: "-10px", fontSize: "22px" }} onClick={() => deleteImageFromServer(img.id)}></i>
            </div>
        </div>
    ))
    const imagesShow = images.map((img, key) => (
        <div key={key} className="w-full border p-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex ">
                    <img src={URL.createObjectURL(img)} alt="" style={{ maxWidth: "100px", borderRadius: "4px" }} />
                    <div className="flex flex-col ml-2 ">
                        <p className=" ml-2 text-gray-500 text-sm mb-2">{img.name}</p>
                        <p className=" ml-2 text-gray-500 text-sm mb-2">
                            {img.size / 1024 < 900 ? (img.size / 1024).toFixed(2) + "KB"
                                : (img.size / (1024 * 1024)).toFixed(2) + "MB"}
                        </p>
                    </div>
                </div>
                <button className="btn btn-danger" onClick={() => deleteImage(key, img)} >
                    <i className="fa-solid fa-trash"></i> Delete
                </button>
            </div>
            <div className="custom-progress">
                <span ref={(e) => (progress.current[key] = e)}
                    className="inner-progress bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"></span>
            </div>
        </div>
    ))

    //Functions

    // Edit form => after send dummy data
    async function handleEdit(e) {
        setLoading(true);
        e.preventDefault();
        try {
            for (let i = 0; i < idsFromServer.length; i++) {

                await Axios.delete(`product-img/${idsFromServer[i]}`);
            }
            await Axios.post(`${Pro}/edit/${id}`, form)
            navigate("/dashboard/products")
        } catch (err) {
            setLoading(false)
            console.log(err)
        }
    }
    const j = useRef(-1)
    // Handle Images Change
    async function handleImagesChange(e) {
        setImages((prev) => [...prev, ...e.target.files]);
        const imagesAsFiles = e.target.files;
        const data = new FormData();
        for (let i = 0; i < imagesAsFiles.length; i++) {
            j.current++
            data.append("image", imagesAsFiles[i]);
            data.append("product_id", id);
            try {
                const res = await Axios.post("/product-img/add", data, {
                    onUploadProgress: (ProgressEvent) => {
                        const { loaded, total } = ProgressEvent;
                        const percent = (Math.floor((loaded * 100) / total));
                        if (percent % 20 === 0) {
                            progress.current[j.current].style.width = `${percent}%`
                            progress.current[j.current].setAttribute('percent', `${percent}%`)
                        }
                    }
                });
                imageIds.current[j.current] = res.data.id
            } catch (err) {
                console.log(err)
            }
        }
    }
    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })

    }
    function handleInput() {
        openInputFile.current.click()
    }
    async function deleteImage(id, img) {
        const target = imageIds.current[id];
        try {
            await Axios.delete(`product-img/${target}`);
            setImages((prev) => prev.filter((image) => image !== img));
            imageIds.current = imageIds.current.filter((i) => i !== target);
            --j.current

        } catch (err) {
            console.log(err)
        }
    }
    async function deleteImageFromServer(id) {
        setImagesFromServer((prev) => prev.filter((img) => img.id !== id));
        setIdsFromServer((prev) => { return [...prev, id] })

    }
    return (
        <>
            {loading && <Loading />}
            <div className="user flex-1 " style={{ margin: "100px 30px" }}>
                <h1 className="text-center text-color mb-4" >Edit Product</h1>
                <form onSubmit={handleEdit}>
                    <div className="mb-3">
                        <label htmlFor="select" className="form-label">category:</label>
                        <select id="select" className="form-select" name="category" value={form.category} onChange={handleChange}>
                            <option disabled value="">Select a category</option>
                            {getCategories}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title:</label>
                        <input type="text" className="form-control" id="title" name="title" value={form.title} onChange={handleChange} required ref={focus} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="desc" className="form-label">Description:</label>
                        <input type="text" className="form-control" id="desc" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="price" className="form-label">Price:</label>
                        <input type="text" className="form-control" id="price" name="price" value={form.price} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="discount" className="form-label">Discount:</label>
                        <input type="text" className="form-control" id="discount" name="discount" value={form.discount} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="about" className="form-label">About:</label>
                        <input type="text" className="form-control" id="about" name="About" value={form.About} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="stock" className="form-label">Stock:</label>
                        <input type="text" className="form-control" id="stock" name="stock" value={form.stock} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="imgs" className="form-label">Choose Images:</label>
                        <input type="file" className="form-control" id="imgs" onChange={handleImagesChange} multiple hidden ref={openInputFile} />
                    </div>
                    <div className="mb-3 flex flex-col items-center justify-center py-2 rounded" style={{ backgroundColor: "#f5f5f5", border: "2px dashed  rgb(244 114 182" }} onClick={handleInput}>
                        <img className=" hover:w-28" src={require("../../../assets/upload.png")} alt="upload here" width={"100px"} style={{ cursor: "pointer" }} />
                        <p className="text-pink-400 font-bold hover:text-pink-600 " style={{ cursor: "pointer" }}>Upload Images</p>
                    </div>
                    <div className="mb-5 flex  items-start gap-2">
                        {imagesShowFromServer}
                    </div>
                    <div className="mb-5 flex flex-col items-start gap-2">
                        {imagesShow}
                    </div>
                    <Link to={"/dashboard/products"} className="bg-main-color  py-2 px-3  shadow-lg   rounded-full text-white">Back</Link>
                    <button type="submit" className="bg-highlight shadow-lg   py-2 px-3 ml-2 rounded-full text-white">Save</button>
                </form>
            </div>
        </>
    )
}
