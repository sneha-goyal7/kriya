import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { toast } from "sonner";

import { BookOpen, Image, IndianRupee } from "lucide-react";

import { Input } from "@/shared/ui/input";

import { Button } from "@/shared/ui/button";

import { Textarea } from "@/shared/ui/textarea";

import { useCreateCourseMutation } from "@/features/course/courseApi";

function CreateCourse() {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const [formData, setFormData] = useState({
    title: "",

    description: "",

    category: "Development",

    thumbnail: null,
  });

  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // THUMBNAIL

    if (name === "thumbnail") {
      const file = files[0];

      setFormData({
        ...formData,

        thumbnail: file,
      });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }

      return;
    }

    setFormData({
      ...formData,

      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();

      form.append("title", formData.title);

      form.append("description", formData.description);

      form.append("category", formData.category);

      form.append("instructor", user._id || user.id);

      if (formData.thumbnail) {
        form.append("thumbnail", formData.thumbnail);
      }

      await createCourse(form).unwrap();

      toast.success("Course created successfully");

      navigate("/instructor/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create course");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* HEADER */}

      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Create New Course
        </h1>

        <p
          className="
            mt-3
            text-muted-foreground
          "
        >
          Build and publish your premium learning experience.
        </p>
      </div>

      {/* FORM */}

      <div
        className="
          rounded-2xl shadow-sm
          border border-border bg-card p-8 md:p-10
        "
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* TITLE */}

          <div className="space-y-3">
            <label className="text-sm font-medium">Course Title</label>

            <div className="relative">
              <BookOpen
                size={18}
                className="
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <Input
                name="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleChange}
                className="pl-11"
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-3">
            <label className="text-sm font-medium">Description</label>

            <Textarea
              name="description"
              placeholder="Write detailed course description..."
              value={formData.description}
              onChange={handleChange}
              className="min-h-[180px]"
            />
          </div>

          {/* GRID */}

          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="
                flex h-11 w-full
                rounded-xl border border-input
                bg-background
                px-4 py-2
                text-sm
                outline-none
                focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all
              "
            >
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          {/* THUMBNAIL */}

          <div className="space-y-4">
            <label className="text-sm font-medium">Course Thumbnail</label>

            <label
              className="
                flex cursor-pointer
                flex-col items-center
                justify-center gap-4
                rounded-2xl
                border-2 border-dashed border-border
                p-12 transition-all
                hover:bg-muted/50 hover:border-primary/50
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="
                    h-52 w-full
                    rounded-xl
                    object-cover shadow-sm
                  "
                />
              ) : (
                <>
                  <div
                    className="
                      flex h-16 w-16
                      items-center justify-center
                      rounded-xl border border-primary/20
                      bg-primary/5
                    "
                  >
                    <Image size={30} className="text-primary" />
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold">Upload Thumbnail</h3>

                    <p
                      className="
                        mt-1 text-sm
                        text-muted-foreground
                      "
                    >
                      PNG, JPG, WEBP
                    </p>
                  </div>
                </>
              )}

              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* SUBMIT */}

          <Button
            type="submit"
            disabled={isLoading}
            className="
              h-12 w-full md:w-auto rounded-xl shadow-sm
              px-8 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all
            "
          >
            {isLoading ? "Creating Course..." : "Create Course"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;
