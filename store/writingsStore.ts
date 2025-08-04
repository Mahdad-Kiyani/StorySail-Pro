import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import zustandStorage from "./zustandStore";

export interface UserWriting {
	id: string;
	user_id: string;
	title: string;
	content: string;
	category: string;
	tags: string[];
	stars_count: number;
	poster_image_url: string;
	created_at: Date;
	updated_at: Date;
}

export interface WritingsStore {
	articles: UserWriting[];
	drafts: UserWriting[];
	setArticles: (articles: UserWriting[]) => void;
	addArticle: (article: UserWriting) => Promise<{ success: boolean; error?: string }>;
	removeArticle: (id: string) => Promise<{ success: boolean; error?: string }>;
	getArticlesByUser: () => Promise<{ success: boolean; error?: string }>;
	saveDraft: (draft: UserWriting) => void;
	deleteDraft: (id: string) => void;
}

const useWritingsStore = create<WritingsStore>()(
	persist(
		(set, get) => ({
			articles: [],
			drafts: [],
			setArticles: (articles: UserWriting[]) => {
				set({ articles });
			},
			addArticle: async (article: UserWriting) => {
				try {
					const { data, error } = await supabase
						.from("user_writings")
						.upsert(article);

					if (error) {
						console.error("Error adding article:", error.message);
						return { success: false, error: error.message };
					}

					if (!data) {
						return { success: false, error: "No data returned after adding article" };
					}

					const currentArticles = get().articles;
					const currentDrafts = get().drafts;

					// Update articles list
					const updatedArticles = currentArticles.length === 0 
						? [article]
						: currentArticles.map((existingArticle) =>
							existingArticle.id === article.id ? article : existingArticle
						);

					// Add new article if it doesn't exist
					if (!updatedArticles.find((existingArticle) => existingArticle.id === article.id)) {
						updatedArticles.push(article);
					}

					// Remove from drafts if it was a draft
					const updatedDrafts = currentDrafts.filter((draft) => draft.id !== article.id);

					set({ 
						articles: updatedArticles,
						drafts: updatedDrafts
					});

					return { success: true };
				} catch (error) {
					console.error("Error adding article:", error);
					return { success: false, error: "Network error" };
				}
			},
			removeArticle: async (id: string) => {
				try {
					const { error } = await supabase
						.from("user_writings")
						.delete()
						.eq("id", id);

					if (error) {
						console.error("Error removing article:", error.message);
						return { success: false, error: error.message };
					}

					const currentArticles = get().articles;
					const updatedArticles = currentArticles.filter((article) => article.id !== id);
					set({ articles: updatedArticles });

					return { success: true };
				} catch (error) {
					console.error("Error removing article:", error);
					return { success: false, error: "Network error" };
				}
			},
			getArticlesByUser: async () => {
				try {
					const currentSession = await supabase.auth.getSession();
					
					if (!currentSession?.data?.session?.user?.id) {
						return { success: false, error: "No user logged in" };
					}

					const userId = currentSession.data.session.user.id;
					const { data, error } = await supabase
						.from("user_writings")
						.select("*")
						.eq("user_id", userId);

					if (error) {
						console.error("Error fetching articles:", error.message);
						return { success: false, error: error.message };
					}

					set({ articles: data || [] });
					return { success: true };
				} catch (error) {
					console.error("Error fetching articles:", error);
					return { success: false, error: "Network error" };
				}
			},
			saveDraft: (draft: UserWriting) => {
				const currentDrafts = get().drafts;

				if (currentDrafts.length === 0) {
					set({ drafts: [draft] });
					return;
				}

				// Update existing draft or add new one
				const updatedDrafts = currentDrafts.map((existingDraft) =>
					existingDraft.id === draft.id ? draft : existingDraft
				);

				// Add new draft if it doesn't exist
				if (!updatedDrafts.find((existingDraft) => existingDraft.id === draft.id)) {
					updatedDrafts.push(draft);
				}

				set({ drafts: updatedDrafts });
			},
			deleteDraft: (id: string) => {
				const currentDrafts = get().drafts;
				const updatedDrafts = currentDrafts.filter((draft) => draft.id !== id);
				set({ drafts: updatedDrafts });
			}
		}),
		{
			name: "writings-storage",
			storage: createJSONStorage(() => zustandStorage),
		}
	)
);

export default useWritingsStore;
