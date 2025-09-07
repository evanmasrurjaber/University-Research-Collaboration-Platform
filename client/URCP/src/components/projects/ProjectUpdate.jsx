import React, { useEffect, useState } from 'react'
import Navigationbar from '../shared/Navigationbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { PROJECT_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { X } from 'lucide-react'

function ProjectUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    openRoles: [],
    tags: []
  });

  const [currentTag, setCurrentTag] = useState('');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${PROJECT_API_END_POINT}/${id}`, { withCredentials: true });
      if (res.data.success) {
        const p = res.data.project;
        setFormData({
          title: p.title || "",
          description: p.description || "",
            department: p.department || "",
          openRoles: p.openRoles && p.openRoles.length
            ? p.openRoles.map(r => ({ title: r.title || "", description: r.description || "" }))
            : [{ title: "", description: "" }],
          tags: p.tags || []
        });
      }
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDepartmentChange = (value) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleRoleChange = (index, field, value) => {
    const updated = [...formData.openRoles];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, openRoles: updated }));
  };

  const addRole = () => {
    setFormData(prev => ({ ...prev, openRoles: [...prev.openRoles, { title: "", description: "" }] }));
  };

  const removeRole = (i) => {
    setFormData(prev => ({ ...prev, openRoles: prev.openRoles.filter((_, idx) => idx !== i) }));
  };

  const handleTagInputChange = (e) => setCurrentTag(e.target.value);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.description || !formData.department) {
        toast.error("Title, description and department are required");
        return;
      }

      const filteredRoles = formData.openRoles.filter(r =>
        r.title.trim() !== "" && r.description.trim() !== ""
      );

      const payload = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        openRoles: filteredRoles,
        tags: formData.tags
      };

      const res = await axios.put(`${PROJECT_API_END_POINT}/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate(`/project/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigationbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col gap-15'>
      <Navigationbar />
      <div className='flex-1 flex flex-col items-center justify-center px-4 py-8'>
        <div className="mx-auto w-full flex flex-col gap-2 max-w-2xl rounded-none bg-white md:rounded-2xl md:py-8 md:px-3 dark:bg-black"
          style={{ boxShadow: "0 0 20px rgba(34,42,53,.08),0 2px 4px rgba(0,0,0,.06),0 0 0 1px rgba(34,42,53,.05),0 0 6px rgba(34,42,53,.08),0 12px 40px rgba(47,48,55,.05),0 1px 0 rgba(255,255,255,.08) inset" }}>
          <h2 className="px-3 text-xl font-bold">Update Project</h2>
          <p className="px-3 text-xs text-gray-500 dark:text-gray-400">Modify your project details</p>
        </div>

        <div className='mt-4 w-full max-w-2xl rounded-none bg-white px-4 md:rounded-2xl md:p-8 dark:bg-black'
          style={{ boxShadow: "0 0 20px rgba(34,42,53,.08),0 2px 4px rgba(0,0,0,.06),0 0 0 1px rgba(34,42,53,.05),0 0 6px rgba(34,42,53,.08),0 12px 40px rgba(47,48,55,.05),0 1px 0 rgba(255,255,255,.08) inset" }}>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="description">Project Description</Label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-black dark:border-gray-700"
              />
            </div>

            <div>
              <Label>Department</Label>
              <div className="py-2">
                <Select value={formData.department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-black">
                    <SelectGroup>
                      <SelectLabel>Schools and Departments</SelectLabel>
                      <SelectItem value="BRAC Business School">BRAC Business School</SelectItem>
                      <SelectItem value="School of Data and Sciences">School of Data and Sciences</SelectItem>
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

            <div className='flex flex-col gap-3'>
              <Label>Project Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                value={currentTag}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Open Roles</Label>
                <button
                  type="button"
                  onClick={addRole}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add Role
                </button>
              </div>
              <div className="space-y-4 mt-2">
                {formData.openRoles.map((role, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Role #{idx + 1}</h4>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeRole(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Role Title</Label>
                        <Input
                          value={role.title}
                          onChange={(e) => handleRoleChange(idx, 'title', e.target.value)}
                          placeholder="e.g., Data Analyst"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Role Description</Label>
                        <Input
                          value={role.description}
                          onChange={(e) => handleRoleChange(idx, 'description', e.target.value)}
                          placeholder="Responsibilities"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="group/btn relative block w-full rounded-lg bg-gradient-to-l from-blue-500 to-blue-700 px-4 py-3 font-medium text-white transition-all hover:scale-103 hover:shadow-lg"
            >
              <span>Save Changes</span>
              <BottomGradient />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export default ProjectUpdate;