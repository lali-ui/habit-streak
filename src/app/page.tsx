'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Leaderboard } from '@/app/components/Leaderboard';
import { FriendsList } from '@/app/components/FriendsList';
import { User } from '@/app/types';
import clsx from 'clsx';

import 'react-calendar/dist/Calendar.css';

interface Task {
  id: string;
  label: string;
  isChecked: boolean;
  streak: number;
  lastChecked: string | null;
  createdAt: string;
  completionHistory: string[];
  category: string;
}

interface HabitTemplate {
  category: string;
  habits: {
    label: string;
    description?: string;
  }[];
}

const initialTasks: Task[] = [
  // Removed all tasks
  // { id: 'Walking', label: 'Walking', isChecked: false, lastChecked: null, createdAt: new Date().toISOString(), completionHistory: [], category: 'Personal' },
  // { id: 'water', label: 'Drink 3L of water', isChecked: false, lastChecked: null, createdAt: new Date().toISOString(), completionHistory: [], category: 'Personal' },
  // { id: 'reading', label: 'Reading', isChecked: false, lastChecked: null, createdAt: new Date().toISOString(), completionHistory: [], category: 'Personal' },
];

const habitTemplates: HabitTemplate[] = [
  {
    category: "Fitness",
    habits: [
      { label: "Run 3 times a week", description: "Build cardio endurance" },
      { label: "30 minutes daily walk", description: "Stay active consistently" },
      { label: "10 minutes stretching", description: "Improve flexibility" }
    ]
  },
  {
    category: "Mental Health",
    habits: [
      { label:  "Practice gratitude daily", description: "Write 3 things you're grateful for" },
      { label: "10 minutes meditation", description: "Clear your mind" },
      { label: "Daily journaling", description: "Process your thoughts" }
    ]
  },
  {
    category: "Productivity",
    habits: [
      { label: "Write 500 words", description: "Build writing habit" },
      { label: "Read 20 pages", description: "Expand knowledge daily" },
      { label: "No social media until noon", description: "Focus on morning priorities" }
    ]
  }
];

const Checkbox = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null);
  const [swipePosition, setSwipePosition] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'You',
    email: '',
    friends: [],
    pendingRequests: [],
    streakScore: 0
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        setTasks(JSON.parse(savedTasks)); // Load existing tasks
    } else {
        localStorage.setItem('tasks', JSON.stringify([])); // Initialize with an empty array
    }
    
    // Removed streak loading
  }, []);

  // Add console.log to check tasks state
  useEffect(() => {
    console.log('Current tasks:', tasks);
  }, [tasks]);

  // Modify handleCheck to ensure streak is updating
  const handleCheck = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        const today = new Date().toDateString();
        const isChecking = !task.isChecked;
        
        let newStreak = task.streak;
        const newCompletionHistory = [...task.completionHistory];
        
        if (isChecking) {
          newStreak = task.streak + 1;
          newCompletionHistory.push(today);
          
          // Update user's streak score
          setCurrentUser(prev => ({
            ...prev,
            streakScore: prev.streakScore + 1
          }));
          
          // Save updated streak to localStorage
          const updatedStreaks = { ...JSON.parse(localStorage.getItem('streaks') || '{}'), [taskId]: newStreak };
          localStorage.setItem('streaks', JSON.stringify(updatedStreaks));
          
          setTimeout(() => {
            setTasks(currentTasks => 
              currentTasks.map(t => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    isChecked: false
                  };
                }
                return t;
              })
            );
          }, 3000);
        }

        return {
          ...task,
          isChecked: isChecking,
          streak: newStreak,
          lastChecked: isChecking ? today : task.lastChecked,
          completionHistory: newCompletionHistory,
        };
      })
    );
  };

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // New function to handle task deletion
  const handleDelete = (taskId: string) => {
    setTasks((prevTasks) => {
      const taskToDelete = prevTasks.find(task => task.id === taskId);
      if (!taskToDelete) {
        console.error(`Task with id ${taskId} not found for deletion.`);
        return prevTasks; // Early return if task not found
      }
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Store the deleted task and show the undo button
      if (taskToDelete) {
        setDeletedTask(taskToDelete);
        setShowUndo(true);
        
        // Hide undo button after 5 seconds
        setTimeout(() => {
          setShowUndo(false);
          setDeletedTask(null);
        }, 5000);
      }
      
      return updatedTasks;
    });
  };

  // Add the handleUndo function
  const handleUndo = () => {
    if (deletedTask) {
      setTasks(prevTasks => [...prevTasks, deletedTask]);
      setShowUndo(false);
      setDeletedTask(null);
    }
  };

  // Handle touch start to detect swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setSwipePosition(0);
  };

  // Handle touch move to detect swipe direction
  const handleTouchMove = (e: React.TouchEvent, taskId: string) => {
    if (touchStart === null) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStart;

    // If swiped right, update swipe position
    if (diffX > 0) {
      setSwipePosition(diffX);
      setSwipedTaskId(taskId);
    }
  };

  // Reset swipe state on touch end
  const handleTouchEnd = () => {
    if (swipePosition && swipePosition > 100) {
      setSwipePosition(150);
    } else {
      setSwipePosition(null);
      setSwipedTaskId(null);
    }
    setTouchStart(null);
  };

  // Add new task function
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(), // Using timestamp as a simple unique ID
      label: newTaskLabel.trim(),
      isChecked: false,
      streak: 0,
      lastChecked: null,
      createdAt: new Date().toISOString(),
      completionHistory: [],
      category: 'Personal'
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskLabel(''); // Clear input after adding
  };

  const handleEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTaskId(taskId);
      setEditingLabel(task.label);
    }
  };

  // Helper function to get task classes
  const getTaskClasses = (task: Task) => {
    return clsx(
      'relative cursor-pointer flex items-center gap-2',
      {
        'text-yellow-400 group-hover:text-yellow-300': task.isChecked,
        'text-gray-100 group-hover:text-gray-400': !task.isChecked,
      }
    );
  };

  // Debounce function for input handling
  const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSaveEdit = debounce(() => {
    if (!editingLabel.trim()) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingTaskId
          ? { ...task, label: editingLabel.trim() }
          : task
      )
    );
    setEditingTaskId(null);
    setEditingLabel('');
  }, 300); // Adjust delay as needed

  // Function to share progress with friends
  const handleShareProgress = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && navigator.share) {
      navigator.share({
        title: 'Habit Progress',
        text: `I've maintained a ${task.streak} day streak for ${task.label}!`,
        url: window.location.href
      });
    }
  }, [tasks]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4">
      <div className="flex flex-col gap-6 w-full max-w-sm">
          <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Habit Tracker</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFriends(true)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title="Friends & Accountability"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskLabel}
                onChange={(e) => setNewTaskLabel(e.target.value)}
                placeholder="Add new habit..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800/80 text-gray-100 border border-gray-700/50 
                  focus:outline-none focus:border-yellow-400/50 focus:bg-gray-800 placeholder-gray-500
                  transition-all duration-200"
              />
              <button
                type="submit"
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 
                  transition-all duration-200 font-medium hover:shadow-lg hover:shadow-yellow-400/20
                  active:scale-95"
              >
                Add
              </button>
            </form>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full px-4 py-3 text-gray-400 hover:text-gray-300 transition-all duration-200 
                text-sm flex items-center justify-center gap-2 rounded-lg hover:bg-gray-800/50
                group border border-transparent hover:border-gray-700/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''} 
                  group-hover:text-yellow-400`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="group-hover:text-yellow-400">Browse Templates</span>
            </button>

            {showTemplates && (
              <div className="space-y-6 bg-gray-800/50 p-5 rounded-xl border border-gray-700/50
                backdrop-blur-sm shadow-xl animate-fade-in">
                {habitTemplates.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-200 font-medium">{category.category}</h3>
                      <div className="h-px flex-1 bg-gray-700/50"></div>
                    </div>
                    <div className="grid gap-2">
                      {category.habits.map((habit) => (
                        <button
                          key={habit.label}
                          onClick={() => {
                            setNewTaskLabel(habit.label);
                            setShowTemplates(false);
                          }}
                          className="w-full text-left p-4 rounded-lg bg-gray-800/80 hover:bg-gray-800 
                            transition-all duration-200 group border border-gray-700/50 hover:border-gray-600
                            hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="text-gray-100 font-medium group-hover:text-yellow-400 
                                transition-colors duration-200">
                                {habit.label}
                              </div>
                              {habit.description && (
                                <div className="text-sm text-gray-400 group-hover:text-gray-300">
                                  {habit.description}
                                </div>
                              )}
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500 group-hover:text-yellow-400 
                                transition-all duration-200 transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing tasks list */}
        {tasks.map((task) => (
                              <div 
                                key={task.id} 
                                className={getTaskClasses(task)}
                                onClick={() => handleCheck(task.id)}
                                onTouchStart={handleTouchStart}
                                onTouchMove={(e) => handleTouchMove(e, task.id)}
                                onTouchEnd={handleTouchEnd}
                                style={{
                                  transform: swipePosition !== null && swipedTaskId === task.id 
                                    ? `translateX(${Math.min(swipePosition, 150)}px)`
                                    : 'translateX(0)',
                                  transition: swipePosition !== null ? 'none' : 'transform 0.3s ease',
                                }}
                              >
                                <div className="flex-1 flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                                  <div className="relative w-8 h-8 [perspective:1000px]">
                                    <input
                                      type="checkbox"
                                      checked={task.isChecked}
                                      onChange={() => handleCheck(task.id)}
                                      className="peer hidden"
                                    />
                                    <div
                                      className={`
                                        absolute inset-0 w-full h-full
                                        transition-all duration-300
                                        [transform-style:preserve-3d]
                                        ${task.isChecked ? 'animate-flip-forward' : 'animate-flip-backward'}
                                        group-hover:scale-105
                                        group-hover:-rotate-x-3
                                        group-hover:rotate-y-3
                                        shadow-md
                                        active:scale-95
                                        touch-manipulation
                                      `}
                                    >
                                      {/* Front face */}
                                      <div
                                        className={`
                                          absolute w-full h-full
                                          border-2 ${task.isChecked ? 'border-yellow-400' : 'border-gray-700'} rounded-md
                                          [backface-visibility:hidden]
                                          bg-gray-800
                                          transition-all duration-200
                                          group-hover:border-gray-600
                                          group-hover:shadow-gray-700/20
                                          group-hover:shadow-lg
                                          active:border-gray-500
                                        `}
                                      />

                                      {/* Back face */}
                                      <div
                                        className={`
                                          absolute w-full h-full
                                          border-2 border-yellow-400 rounded-md
                                          [backface-visibility:hidden]
                                          [transform:rotateY(180deg)]
                                          bg-yellow-400
                                          flex items-center justify-center
                                          transition-all duration-200
                                          group-hover:shadow-yellow-400/20
                                          group-hover:shadow-lg
                                          active:bg-yellow-500
                                        `}
                                      >
                                        <svg
                                          className="h-6 w-6 stroke-white"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between flex-1">
                                    {editingTaskId === task.id ? (
                                      <form 
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleSaveEdit();
                                        }}
                                        className="flex-1 flex items-center gap-2"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <input
                                          type="text"
                                          value={editingLabel}
                                          onChange={(e) => setEditingLabel(e.target.value)}
                                          className="flex-1 bg-gray-800 text-gray-100 px-3 py-1 rounded-lg"
                                          autoFocus
                                        />
                                        <button
                                          type="submit"
                                          className="text-yellow-400 hover:text-yellow-300"
                                        >
                                          Save
                                        </button>
                                      </form>
                                    ) : (
                                      <div className="flex items-center justify-between flex-1">
                                        <span
                                          className={`
                                            select-none text-lg
                                            transition-colors duration-200
                                            ${task.isChecked 
                                              ? 'text-yellow-400 group-hover:text-yellow-300' 
                                              : 'text-gray-100 group-hover:text-gray-400'
                                            }
                                          `}
                                        >
                                          {task.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                                                handleEdit(task.id);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-700/50 transition-colors"
                                            aria-label={`Edit task: ${task.label}`}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                              />
                                            </svg>
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(task.id);
                                            }}
                                            className="p-1 rounded-full hover:bg-red-500/10 transition-colors group/delete"
                                            aria-label={`Delete task: ${task.label}`}
                                          >
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-4 w-4 text-gray-400 group-hover/delete:text-red-500"
                                              fill="none" 
                                              viewBox="0 0 24 24" 
                                              stroke="currentColor"
                                            >
                                              <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                              />
                                            </svg>
                                          </button>
                                          <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full">
                                            <span className="text-lg">🔥</span>
                                            <span className="text-sm font-bold text-gray-100">
                                              {task.streak}
                                            </span>
                                          </div>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShareProgress(task.id); // Share progress button
                                            }}
                                            className="p-1 rounded-full hover:bg-blue-500/10 transition-colors"
                                          >
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              className="h-4 w-4 text-gray-400"
                                              fill="none" 
                                              viewBox="0 0 24 24" 
                                              stroke="currentColor"
                                            >
                                              <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
        ))}

          {showUndo && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 
              bg-gray-800/95 backdrop-blur-sm text-gray-100 
              px-6 py-3 rounded-xl shadow-2xl
              flex items-center gap-4 animate-slide-up z-50
              border border-gray-700/50
              hover:scale-105 hover:shadow-yellow-400/10 hover:border-yellow-400/20
              transition-all duration-300 ease-out
              max-w-md w-[90%]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 animate-bounce-slow">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </span>
                  <span className="font-medium">
                    <span className="text-red-400">&ldquo;{deletedTask?.label}&rdquo;</span> deleted
                  </span>
                </div>

                <button
                  onClick={handleUndo}
                  className="flex items-center gap-2 px-4 py-1.5
                    rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20
                    transition-all duration-200 group
                    active:scale-95 hover:shadow-lg
                    border border-yellow-400/20 hover:border-yellow-400/40
                    ml-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-400 group-hover:animate-spin-once"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-yellow-400 font-medium">Undo</span>
                </button>
              </div>
            </div>
          )}

          <Leaderboard 
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            users={[currentUser]}
          />
          <FriendsList 
            isOpen={showFriends}
            onClose={() => setShowFriends(false)}
            currentUser={currentUser}
            onSendRequest={(email) => {
              console.log('Send request to:', email);
              // Add friend request logic here
            }}
            onAcceptRequest={(userId) => {
              console.log('Accept request from:', userId);
              // Add accept request logic here
            }}
            onMessage={(friendId) => {
              console.log('Message friend:', friendId);
              // Add messaging logic here
            }}
          />
      </div>
    </div>
  );
};

export default Checkbox;
