import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigationbar from "../shared/Navigationbar";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../ui/button.jsx";
import { Label } from "../ui/label.jsx";
import { Input } from "../ui/input.jsx";
import { USER_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UpdateProfile() {
  const navigate = useNavigate();
  const auth = useAuth() || {};
  const { user, refreshUser } = auth;

  const [form, setForm] = useState({
    name: "",
    department: "",
    bio: "",
    file: "",
    interests: [],
    interestInput: "",
    profilePhotoUrl: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); // add

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
        department: user?.department,
        city: user?.profile?.city || "",
        bio: user?.profile?.bio || "",
        profilePhotoUrl: user?.profile?.profilePhotoUrl || "",
        file: null,
        interests: Array.isArray(user?.profile?.interests)
          ? user.profile.interests.filter(Boolean)
          : [],
      }));
    }
  }, [user]);

  function handleAddInterest(e) {
    e.preventDefault();
    const raw = form.interestInput.trim();
    if (!raw) return;
    const tokens = raw.split(",").map((t) => t.trim()).filter(Boolean);
    const next = Array.from(new Set([...(form.interests || []), ...tokens]));
    setForm((f) => ({ ...f, interests: next, interestInput: "" }));
  }

  function handleRemoveInterest(i) {
    setForm((f) => ({
      ...f,
      interests: (f.interests || []).filter((_, idx) => idx !== i),
    }));
  }
  function changeFileHandler(e) {
    setForm((f) => ({ ...f, file: e.target.files?.[0] }));
  }
  function handleRemovePhoto() {
    setForm((f) => ({ ...f, profilePhotoUrl: "" }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("department", form.department);
    formData.append("profile.bio", form.bio);
    formData.append("profile.interests", JSON.stringify(form.interests));
    if (form.file) {
      formData.append("file", form.file);
    }else{
      if (form.profilePhotoUrl === "") {
        formData.append("profile.profilePhotoUrl", form.profilePhotoUrl);
      }
    }

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/profile/update`, formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        try {
          refreshUser?.();
        } catch { }
        toast.success(res.data?.message || "Profile updated");
        navigate("/profile");
      } else {
        const msg = res.data?.message || "Update failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='h-screen flex flex-col'>
      <Navigationbar />
      <div className="w-xl mx-auto mt-28 rounded-2xl p-6 bg-white dark:bg-black" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
        <h1 className="text-xl font-semibold mb-6">Update Profile</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 flex flex-col gap-2">
              <Label htmlFor="department">Department</Label>
              <div className="px-1">
                <Select defaultValue={form.department} onValueChange={(value) => setForm((f) => ({ ...f, department: value }))}>
                  <SelectTrigger className="w-full max-w-md truncate">
                    <SelectValue placeholder={form.department} />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectGroup>
                      <SelectLabel>Schools and Departments</SelectLabel>
                      <SelectItem value="BRAC Business School">BRAC Business School</SelectItem>
                      <SelectItem value="BSRM School of Engineering">BSRM School of Engineering</SelectItem>
                      <SelectItem value="School of Law">School of Law</SelectItem>
                      <SelectItem value="School of Pharmacy">School of Pharmacy</SelectItem>
                      <SelectItem value="School of Architecture and Design">School of Architecture and Design</SelectItem>
                      <SelectItem value="School of Humanities and Social Sciences">School of Humanities and Social Sciences</SelectItem>
                      <SelectItem value="School of General Education">School of General Education</SelectItem>
                      <SelectItem value="James P Grant School of Public Health">James P Grant School of Public Health</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="space-y-2 flex flex-col gap-1">
              <Label htmlFor="photoUrl">Profile Photo</Label>
              <Input
                accept="image/*"
                type="file"
                onChange={changeFileHandler}
                className="max-w-sm min-w-62"
              />
            </div>
            {form.profilePhotoUrl && (
              <div className="flex justify-center items-center gap-3">
                <img
                  src={form.profilePhotoUrl}
                  alt="Profile Preview"
                  className="w-20 h-20 object-cover"
                />
                <span className="w-18 inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200 dark:bg-neutral-900 dark:text-gray-200 dark:border-gray-800">
                  <button type="button" onClick={() => handleRemovePhoto()} className="text-gray-500 hover:text-red-500">
                    Remove x
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex flex-col gap-1">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="w-full min-h-32 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>

          <div className="space-y-2 flex flex-col gap-1">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(form.interests || []).map((it, idx) => (
                <span key={`${it}-${idx}`} className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200 dark:bg-neutral-900 dark:text-gray-200 dark:border-gray-800">
                  {it}
                  <button type="button" onClick={() => handleRemoveInterest(idx)} className="text-gray-500 hover:text-red-500" aria-label={`Remove ${it}`} title="Remove">
                    ×
                  </button>
                </span>
              ))}
              {!form.interests?.length && <span className="text-sm text-gray-500">No interests yet</span>}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add interest"
                value={form.interestInput}
                onChange={(e) => setForm((f) => ({ ...f, interestInput: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddInterest(e);
                }}
              />
              <Button className="mt-1" type="button" onClick={handleAddInterest} variant="secondary">
                Add
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" className="hover:bg-gray-100" onClick={() => navigate("/profile")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}