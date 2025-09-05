import React, { useState } from 'react'
import { NavbarLogo } from '../ui/resizable-navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Navigationbar from '../shared/Navigationbar'
import { PROJECT_API_END_POINT } from '../../utils/constant'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { X } from 'lucide-react'

function ProjectForm() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        department: user?.department || "",
        openRoles: [{ title: "", description: "" }],
        tags: []
    });

    const [currentTag, setCurrentTag] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDepartmentChange = (value) => {
        setFormData({ ...formData, department: value });
    };

    const handleRoleChange = (index, field, value) => {
        const updatedRoles = [...formData.openRoles];
        updatedRoles[index][field] = value;
        setFormData({ ...formData, openRoles: updatedRoles });
    };

    const addRole = () => {
        setFormData({
            ...formData,
            openRoles: [...formData.openRoles, { title: "", description: "" }]
        });
    };

    const removeRole = (index) => {
        const updatedRoles = formData.openRoles.filter((_, i) => i !== index);
        setFormData({ ...formData, openRoles: updatedRoles });
    };

    const handleTagInputChange = (e) => {
        setCurrentTag(e.target.value);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(currentTag.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, currentTag.trim()]
                });
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate required fields
            if (!formData.title || !formData.description || !formData.department) {
                toast.error("Title, description and department are required");
                return;
            }

            // Remove empty roles
            const filteredRoles = formData.openRoles.filter(
                role => role.title.trim() !== "" && role.description.trim() !== ""
            );

            const projectData = {
                ...formData,
                openRoles: filteredRoles
            };

            const res = await axios.post(`${PROJECT_API_END_POINT}/create`, projectData, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create project");
        }
    };

    return (
        <div className='h-full flex flex-col gap-15'>
            <Navigationbar />
            <div className='flex-1 flex flex-col items-center justify-center px-4 py-8'>
                <div className="mx-auto w-full flex flex-col gap-2 max-w-2xl rounded-none bg-white md:rounded-2xl md:py-8 md:px-3 dark:bg-black"
                    style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
                    <NavbarLogo />
                    <h2 className="px-3 text-xl font-bold text-neutral-800 dark:text-neutral-200">
                        Initiate Project Proposal
                    </h2>
                </div>

                <div className='mt-4 w-full max-w-2xl rounded-none bg-white px-4 md:rounded-2xl md:p-8 dark:bg-black'
                    style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                        <div>
                            <Label htmlFor="title" className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter project title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Project Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe your project proposal"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-black dark:border-gray-700 dark:text-gray-300"
                            />
                        </div>

                        <div>
                            <Label htmlFor="department" className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Department</Label>
                            <div className="py-2">
                                <Select value={formData.department} onValueChange={handleDepartmentChange}>
                                    <SelectTrigger className="w-full px-4 dark:text-gray-300">
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
                            <Label className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Project Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <div key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-2">
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
                            <div>
                                <Input
                                    placeholder="Add tags (press Enter to add)"
                                    value={currentTag}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagKeyDown}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                                Enter keywords relevant to your project (e.g., AI, Healthcare, Sustainability)
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <Label className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">Open Roles</Label>
                                <button
                                    type="button"
                                    onClick={addRole}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    + Add Another Role
                                </button>
                            </div>

                            <div className="space-y-4 mt-2">
                                {formData.openRoles.map((role, index) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-medium">Role #{index + 1}</h4>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRole(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <Label htmlFor={`role-title-${index}`} className="text-xs">Role Title</Label>
                                                <Input
                                                    id={`role-title-${index}`}
                                                    placeholder="e.g., Frontend Developer, Data Analyst"
                                                    value={role.title}
                                                    onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`role-desc-${index}`} className="text-xs">Role Description</Label>
                                                <Input
                                                    id={`role-desc-${index}`}
                                                    placeholder="Describe responsibilities and requirements"
                                                    value={role.description}
                                                    onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                                Define roles needed for your project. You can add multiple roles.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="group/btn relative block w-full rounded-lg bg-gradient-to-l from-blue-500 to-blue-700 px-4 py-3 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] mt-6 transition-all duration-300 hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600 dark:hover:from-zinc-700 dark:hover:to-zinc-700 hover:shadow-white/10"
                        >
                            <span>Submit Project Proposal</span>
                            <BottomGradient />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

const BottomGradient = () => {
    return (
        <>
            <span
                className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span
                className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

export default ProjectForm;