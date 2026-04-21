const BASE_URL = '/api';

console.log("🌐 Running in Production Proxy Mode");
//done
export const getWorkouts = async() =>{
    const result = await fetch(`${BASE_URL}/workouts`, {
        method: 'GET',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })
    
    if(!result.ok){
        const errorText = await result.text();
        console.error("Fetch failed:", errorText);
        throw new Error("Failed to fetch workouts");
    }
    
    return await result.json();
}

export const getFrequentWorkouts = async () => {
    const result = await fetch(`${BASE_URL}/workouts/frequent`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch frequent workouts');
    return await result.json();
};

export const searchWorkoutHistory = async (query: string) => {
    const result = await fetch(`${BASE_URL}/workouts/search-history?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to search history');
    return await result.json();
};

export const getWorkoutLibrary = async () => {
    const result = await fetch(`${BASE_URL}/workouts/library`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch library');
    return await result.json();
};

//done
export const addWorkouts = async(workoutData: any) =>{
    const result = await fetch(`${BASE_URL}/workouts`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include',
        body: JSON.stringify(workoutData)
    })
    
    if(!result.ok){
        const errorText = await result.text();
        console.error("Add failed:", errorText);
        throw new Error("Failed to add workout");
    }
    
    return await result.json();
}
//dome
export const updateWorkout = async(id: number, updatedFields: any)=>{
    const result = await fetch(`${BASE_URL}/workouts/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include",
        body: JSON.stringify(updatedFields)
    })
    
    if(!result.ok){
        throw new Error("Failed to update workout");
    }
    
    return await result.json();
}
//done
export const deleteWorkout = async(id: number) =>{
    const result = await fetch(`${BASE_URL}/workouts/${id}`,{
        method: 'DELETE',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include"
    })
    
    if(!result.ok){
        throw new Error("Failed to delete workout");
    }
    
    return await result.json();
}
//done
export const login = async(email: string, password: string) =>{
    const result = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email,password})
    })
    const data = await result.json();
    if(!result.ok){
        throw new Error(data.message || 'Login Failed')
    }
    return data;
}
//done
export const register = async(userData: any) =>{
    const result = await fetch(`${BASE_URL}/register`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include',
        body: JSON.stringify(userData)
    })

    const data = await result.json();
    if(!result.ok){
        throw new Error(data.message)
    }
    return data;
}
//done
export const getProfile = async () => {
    const result = await fetch(`${BASE_URL}/user/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    
    if (!result.ok) {
        throw new Error("Failed to load profile");
    }
    return await result.json();
}
//done
export const updateProfile = async (profileData: any) => {
    const result = await fetch(`${BASE_URL}/users/patch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
    });
    
    if (!result.ok) {
        throw new Error("Failed to update profile");
    }
    return await result.json();
}
//done
//takes argument with form data to get the content and the url
// will be stored in database
export const createPosts = async(postFormData: FormData) =>{
    const result = await fetch(`${BASE_URL}/createposts`,{
        method: 'POST',
        credentials: 'include',
        body: postFormData
    })

    if(!result.ok){
        const errorData = await result.json().catch(() => ({})); 
        throw new Error(errorData.error || errorData.message || 'Failed to create post');
    }
    return await result.json();
}
//done
export const getFeed = async(cursor: number | null = null, limit: number = 10) =>{
    const url = cursor 
        ? `${BASE_URL}/feed?cursor=${cursor}&limit=${limit}` 
        : `${BASE_URL}/feed?limit=${limit}`;

    const result = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include"
    })
    if(!result.ok){
        throw new Error('Failed fetching feed')
    }
    return await result.json();
}
//done
export const getPost = async(id: number | string) =>{
    const result = await fetch(`${BASE_URL}/posts/${id}`,{
        method: 'GET',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include"
    })
    if(!result.ok){
        throw new Error('Failed fetching post')
    }
    return await result.json();
}
//done
export const deletePost = async(id: number) =>{
    const result = await fetch(`${BASE_URL}/delete/${id}`,{
        method: 'DELETE',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include"
    })
    if(!result.ok){
        throw new Error('Delete Failed')
    }
    return await result.json();
}
//to be continued (errors rn)
export const follow = async(usertoFollow: any) =>{
    const result = await fetch(`${BASE_URL}/follow/${usertoFollow}`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })

    if(!result.ok){ 
        throw new Error('Cannot add')
    }
    return await result.json();
}
//tbc (still have errors)
export const deleteFollower = async(id: number) =>{
    const result = await fetch(`${BASE_URL}/unfollow/${id}`,{
        method: 'DELETE',
        headers: {'Content-Type' : 'application/json'},
        credentials: "include"
    })
    
    if(!result.ok){
        throw new Error("Failed to delete workout");
    }
    
    return await result.json();
}
//done ig
export const likePost = async(postId: any) =>{
    const result = await fetch(`${BASE_URL}/posts/${postId}/like`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Cannot add')
    }
    return await result.json();
}
//done
export const unlikePost = async(postId: any) =>{
    const result = await fetch(`${BASE_URL}/post/${postId}/like`,{
        method: 'DELETE',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Cannot remove like')
    }
    return await result.json();
}
//done
export const searchUsers = async(query: string) => {
    const result = await fetch(`${BASE_URL}/user/search?q=%${query}`,{
        method: 'GET',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Cannot search')
    }
    return await result.json();
}
//done
//to be learned especially cascading comments
//done
export const postComment = async (commentData: { post_id: number, content: string, parent_id?: number }) => {
    const result = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(commentData)
    });

    if (!result.ok) {
        throw new Error('Failed to post comment');
    }
    return await result.json();
};
//tobelearned
export const getComments = async (postId: number) => {
    const result = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) {
        throw new Error('Failed to fetch comments');
    }
    return await result.json();
};
//done
//tobelearned
export interface Notification {
    id: number;
    recipient_id: number;
    sender_id: number;
    type: 'follow' | 'like' | 'comment' | 'reply';
    post_id: number | null;
    comment_id: number | null;
    is_read: boolean;
    created_at: string;
    sender_name: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const result = await fetch(`${BASE_URL}/notifications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) {
        throw new Error('Failed to fetch notifications');
    }
    return await result.json();
};
export const getFoods = async (date?: string, search?: string) => {
    let url = `${BASE_URL}/getfood`;
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (search) params.append('search', search);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const result = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch foods');
    return await result.json();
};

export const addFood = async(foodData: any) =>{
    const result = await fetch(`${BASE_URL}/food/log`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(foodData)
    })

    if(!result.ok){
        throw new Error('Failed to add foods')
    }

    return await result.json();
}

//tdee of users
// done
export const addTdee = async(userData: any) =>{
    const result = await fetch(`${BASE_URL}/tdee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
    })

    if(!result.ok){
        throw new Error('Failed to add userdata')
    }
    return await result.json();
}
// to update the user's current tdee/stats
export const patchTdee = async(userData: any) =>{
    const result = await fetch(`${BASE_URL}/tdee`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
    })

    if(!result.ok){
        const errorData = await result.json();
        throw new Error(errorData.message || 'Failed to update userdata')
    }
    return await result.json();
}
//done
export const getTdee = async() =>{
    const result = await fetch(`${BASE_URL}/profile/tdee`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Failed to fetch userdata')
    }
    return await result.json();
}
export const searchFood = async(query: string) => {
    const result = await fetch(`${BASE_URL}/food/search?query=${encodeURIComponent(query)}`,{
        method: 'GET',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Cannot search')
    }
    return await result.json();
}

//add a delete api for deleteing fooods
export const deleteFood = async(foodId: any) =>{
    const result = await fetch(`${BASE_URL}/deletefood/${foodId}`,{
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    if(!result.ok){
        throw new Error('Failed to delete userdata')
    }
    return await result.json();
}
export const sendChat = async(targetid: any) =>{
    const result = await fetch(`${BASE_URL}/chats/direct`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(targetid)
    })

    if(!result.ok){
       throw new Error('Failed to send mssg') 
    }

    return await result.json();
}
export const sendMessage = async (chatId: string, content: string) => {
    const result = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }) 
    });

    if (!result.ok) {
        throw new Error('Failed to send message');
    }
    
    return await result.json(); // Returns the saved message
};
export const getChat = async(chatId: string) =>{
    const result = await fetch(`${BASE_URL}/chats/${chatId}/messages`,{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    if(!result.ok){
       throw new Error('Failed to get mssg')
    }
    return await result.json();

}

export const getChats = async () => {
    const result = await fetch(`${BASE_URL}/chats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch chats');
    return await result.json();
};

export const getMutualFollowers = async () => {
    const result = await fetch(`${BASE_URL}/users/mutual`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch mutual followers');
    return await result.json();
};

export const createDirectChat = async (targetUserId: number) => {
    const result = await fetch(`${BASE_URL}/chats/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId })
    });
    if (!result.ok) throw new Error('Failed to create chat');
    return await result.json();
};

export const askAICoach = async (userMessage: string) => {
    const result = await fetch(`${BASE_URL}/userstats/askai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userMessage })
    });
    if (!result.ok) throw new Error('Coach is busy');
    return await result.json();
};

// Notice we pass a raw FormData object here!
export const sendChatMessage = async (chatId: string | number, messageData: FormData) => {
    const result = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        // CRITICAL: No 'Content-Type' header here so the browser handles the boundary!
        credentials: 'include',
        body: messageData 
    });

    if (!result.ok) throw new Error('Failed to send message');
    return await result.json();
};
export const connectFatSecret = async () => {
    const result = await fetch(`${BASE_URL}/fatsecret/connect`, {
        method: 'GET',
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to connect to FatSecret');
    return await result.json();
};

export const getFatSecretFood = async (foodId: string) => {
    const result = await fetch(`${BASE_URL}/food/${foodId}`, {
        method: 'GET',
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Failed to fetch food details');
    return await result.json();
};

export const logToFatSecret = async (payload: any) => {
    const result = await fetch(`${BASE_URL}/fatsecret/diary/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
    });
    if (!result.ok) throw new Error('Failed to log to FatSecret');
    return await result.json();
};

export const searchFoodNinja = async (query: string) => {
    const result = await fetch(`${BASE_URL}/logfood/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!result.ok) throw new Error('Food search failed');
    return await result.json();
};

export const saveFoodNinja = async (foodData: any) => {
    const result = await fetch(`${BASE_URL}/savefood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(foodData)
    });
    if (!result.ok) throw new Error('Failed to save food');
    return await result.json();
};

export const logout = async () => {
    const result = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    if(!result.ok) {
        console.warn("Logout server call failed, but clearing local state anyway.");
        return { message: 'Logged out locally' };
    }

    return await result.json();
    
};