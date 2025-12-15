import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Internship Preparation Tracker API",
    timestamp: new Date().toISOString(),
  });
});

// ==================== 1️⃣ TODOS ====================

// GET /todos?profile=piyush
app.get("/todos", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("profile", profile)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /todos
app.post("/todos", async (req, res) => {
  try {
    const { profile, content } = req.body;

    if (!profile || !content) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile and content are required",
      });
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({ profile, content })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Todo created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /todos/:id
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Todo updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /todos/:id
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Todo deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 2️⃣ HABITS ====================

// GET /habits?profile=piyush
app.get("/habits", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("profile", profile)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching habits:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /habits
app.post("/habits", async (req, res) => {
  try {
    const { profile, name, sort_order } = req.body;

    if (!profile || !name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile and name are required",
      });
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({ profile, name, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Habit created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating habit:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /habits/:id
app.put("/habits/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("habits")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Habit updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating habit:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /habits/:id
app.delete("/habits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First delete all habit entries
    await supabase.from("habit_entries").delete().eq("habit_id", id);

    // Then delete the habit
    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Habit deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting habit:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== HABIT ENTRIES ====================

// GET /habit-entries?profile=piyush&from=YYYY-MM-DD&to=YYYY-MM-DD
app.get("/habit-entries", async (req, res) => {
  try {
    const { profile, from, to } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    // First get all habits for this profile
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id")
      .eq("profile", profile);

    if (habitsError) throw habitsError;

    const habitIds = habits.map((h) => h.id);

    if (habitIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        error: null,
      });
    }

    // Then get entries for those habits
    let query = supabase
      .from("habit_entries")
      .select("*")
      .in("habit_id", habitIds);

    if (from) {
      query = query.gte("date", from);
    }

    if (to) {
      query = query.lte("date", to);
    }

    const { data, error } = await query.order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching habit entries:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /habit-entries
app.post("/habit-entries", async (req, res) => {
  try {
    const { habit_id, date, completed } = req.body;

    if (!habit_id || !date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "habit_id and date are required",
      });
    }

    const { data, error } = await supabase
      .from("habit_entries")
      .insert({ habit_id, date, completed: completed || false })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Habit entry created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating habit entry:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /habit-entries/:id
app.put("/habit-entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("habit_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Habit entry updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating habit entry:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 3️⃣ DAILY LOGS - PIYUSH ====================

// GET /daily-logs/piyush
app.get("/daily-logs/piyush", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("daily_logs_piyush")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching daily logs (piyush):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// GET /daily-logs/piyush/:date
app.get("/daily-logs/piyush/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const { data, error } = await supabase
      .from("daily_logs_piyush")
      .select("*")
      .eq("date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.json({
          success: true,
          data: null,
          error: null,
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching daily log by date (piyush):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /daily-logs/piyush
app.post("/daily-logs/piyush", async (req, res) => {
  try {
    const { date, dsa_questions_solved, notes } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Date is required",
      });
    }

    const { data, error } = await supabase
      .from("daily_logs_piyush")
      .insert({ date, dsa_questions_solved: dsa_questions_solved || 0, notes })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Daily log created (piyush):", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating daily log (piyush):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /daily-logs/piyush/:id
app.put("/daily-logs/piyush/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("daily_logs_piyush")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Daily log updated (piyush):", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating daily log (piyush):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /daily-logs/piyush/:id
app.delete("/daily-logs/piyush/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("daily_logs_piyush")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("✅ Daily log deleted (piyush):", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting daily log (piyush):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 4️⃣ DAILY LOGS - SHRUTI ====================

// GET /daily-logs/shruti
app.get("/daily-logs/shruti", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("daily_logs_shruti")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching daily logs (shruti):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// GET /daily-logs/shruti/:date
app.get("/daily-logs/shruti/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const { data, error } = await supabase
      .from("daily_logs_shruti")
      .select("*")
      .eq("date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.json({
          success: true,
          data: null,
          error: null,
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching daily log by date (shruti):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /daily-logs/shruti
app.post("/daily-logs/shruti", async (req, res) => {
  try {
    const { date, python_questions_solved, sql_questions_solved, notes } =
      req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Date is required",
      });
    }

    const { data, error } = await supabase
      .from("daily_logs_shruti")
      .insert({
        date,
        python_questions_solved: python_questions_solved || 0,
        sql_questions_solved: sql_questions_solved || 0,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Daily log created (shruti):", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating daily log (shruti):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /daily-logs/shruti/:id
app.put("/daily-logs/shruti/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("daily_logs_shruti")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Daily log updated (shruti):", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating daily log (shruti):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /daily-logs/shruti/:id
app.delete("/daily-logs/shruti/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("daily_logs_shruti")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("✅ Daily log deleted (shruti):", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting daily log (shruti):", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 5️⃣ CP RATINGS ====================

// GET /cp-ratings
app.get("/cp-ratings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cp_ratings")
      .select("*")
      .order("platform", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching CP ratings:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /cp-ratings/:platform
app.put("/cp-ratings/:platform", async (req, res) => {
  try {
    const { platform } = req.params;
    const { rating } = req.body;

    if (rating === undefined) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Rating is required",
      });
    }

    // First check if platform exists
    const { data: existing } = await supabase
      .from("cp_ratings")
      .select("*")
      .eq("platform", platform)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from("cp_ratings")
        .update({ rating, updated_at: new Date().toISOString() })
        .eq("platform", platform)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from("cp_ratings")
        .insert({ platform, rating })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    console.log("✅ CP rating updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating CP rating:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 6️⃣ CONTEST PERFORMANCE ====================

// GET /contest-logs
app.get("/contest-logs", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contest_logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching contest logs:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /contest-logs
app.post("/contest-logs", async (req, res) => {
  try {
    const {
      platform,
      contest_name,
      date,
      problems_solved,
      total_problems,
      notes,
    } = req.body;

    if (!platform || !contest_name || !date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Platform, contest_name, and date are required",
      });
    }

    const { data, error } = await supabase
      .from("contest_logs")
      .insert({
        platform,
        contest_name,
        date,
        problems_solved: problems_solved || 0,
        total_problems: total_problems || 0,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Contest log created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating contest log:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /contest-logs/:id
app.put("/contest-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("contest_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Contest log updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating contest log:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /contest-logs/:id
app.delete("/contest-logs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("contest_logs").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Contest log deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting contest log:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 7️⃣ A2Z STRIVER PROGRESS ====================

// GET /a2z-progress
app.get("/a2z-progress", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("a2z_progress")
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No row exists, create one with defaults
        const { data: newData, error: insertError } = await supabase
          .from("a2z_progress")
          .insert({
            easy_total: 0,
            easy_solved: 0,
            medium_total: 0,
            medium_solved: 0,
            hard_total: 0,
            hard_solved: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return res.json({
          success: true,
          data: newData,
          error: null,
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching A2Z progress:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /a2z-progress
app.put("/a2z-progress", async (req, res) => {
  try {
    const updates = req.body;

    // Get the single row
    const { data: existing } = await supabase
      .from("a2z_progress")
      .select("*")
      .single();

    if (!existing) {
      // Create if doesn't exist
      const { data, error } = await supabase
        .from("a2z_progress")
        .insert(updates)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ A2Z progress created:", data);

      return res.json({
        success: true,
        data: data,
        error: null,
      });
    }

    // Update existing
    const { data, error } = await supabase
      .from("a2z_progress")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ A2Z progress updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating A2Z progress:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 8️⃣ BLIND 75 ====================

// GET /blind75
app.get("/blind75", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blind75")
      .select("*")
      .order("question_name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching Blind75:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /blind75
app.post("/blind75", async (req, res) => {
  try {
    const { question_name, solution_link, completed } = req.body;

    if (!question_name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Question name is required",
      });
    }

    const { data, error } = await supabase
      .from("blind75")
      .insert({ question_name, solution_link, completed: completed || false })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Blind75 question created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating Blind75 question:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /blind75/:id
app.put("/blind75/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("blind75")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Blind75 question updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating Blind75 question:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /blind75/:id
app.delete("/blind75/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("blind75").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Blind75 question deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting Blind75 question:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 9️⃣ COURSES ====================

// GET /courses?profile=piyush
app.get("/courses", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("profile", profile)
      .order("course_name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /courses
app.post("/courses", async (req, res) => {
  try {
    const { profile, course_name, platform, total_content, completed_content } =
      req.body;

    if (!profile || !course_name || !platform) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile, course_name, and platform are required",
      });
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        profile,
        course_name,
        platform,
        total_content: total_content || 100,
        completed_content: completed_content || 0,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Course created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /courses/:id
app.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Course updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /courses/:id
app.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Course deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 🔟 CERTIFICATES ====================

// GET /certificates?profile=piyush
app.get("/certificates", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("profile", profile)
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /certificates
app.post("/certificates", async (req, res) => {
  try {
    const { profile, title, issuer, date, file_url } = req.body;

    if (!profile || !title || !issuer || !date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile, title, issuer, and date are required",
      });
    }

    const { data, error } = await supabase
      .from("certificates")
      .insert({ profile, title, issuer, date, file_url })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Certificate created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating certificate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /certificates/:id
app.delete("/certificates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("certificates").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Certificate deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting certificate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣1️⃣ RESUME SECTIONS ====================

// GET /resume-sections
app.get("/resume-sections", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resume_sections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching resume sections:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /resume-sections/:id
app.put("/resume-sections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("resume_sections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Resume section updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating resume section:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣2️⃣ PROJECTS - SHRUTI ====================

// GET /projects?profile=shruti
app.get("/projects", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("profile", profile)
      .order("project_name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /projects
app.post("/projects", async (req, res) => {
  try {
    const { profile, project_name, description, notes } = req.body;

    if (!profile || !project_name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile and project_name are required",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({ profile, project_name, description, notes })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Project created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /projects/:id
app.put("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Project updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /projects/:id
app.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Project deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣3️⃣ SKILLS - SHRUTI ====================

// GET /skills?profile=shruti
app.get("/skills", async (req, res) => {
  try {
    const { profile } = req.query;

    if (!profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile parameter is required",
      });
    }

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("profile", profile)
      .order("skill_name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /skills
app.post("/skills", async (req, res) => {
  try {
    const { profile, skill_name, notes } = req.body;

    if (!profile || !skill_name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Profile and skill_name are required",
      });
    }

    const { data, error } = await supabase
      .from("skills")
      .insert({ profile, skill_name, notes })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Skill created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /skills/:id
app.put("/skills/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("skills")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Skill updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating skill:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /skills/:id
app.delete("/skills/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("skills").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Skill deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting skill:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣4️⃣ CASE STUDIES ====================

// GET /case-studies
app.get("/case-studies", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching case studies:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /case-studies
app.post("/case-studies", async (req, res) => {
  try {
    const { title, notes, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Title and date are required",
      });
    }

    const { data, error } = await supabase
      .from("case_studies")
      .insert({ title, notes, date })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Case study created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating case study:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /case-studies/:id
app.put("/case-studies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("case_studies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Case study updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating case study:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /case-studies/:id
app.delete("/case-studies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("case_studies").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Case study deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting case study:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣5️⃣ GUESSTIMATES ====================

// GET /guesstimates
app.get("/guesstimates", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("guesstimates")
      .select("*")
      .order("topic", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching guesstimates:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /guesstimates
app.post("/guesstimates", async (req, res) => {
  try {
    const { topic, learnings, notes } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Topic is required",
      });
    }

    const { data, error } = await supabase
      .from("guesstimates")
      .insert({ topic, learnings, notes })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Guesstimate created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating guesstimate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /guesstimates/:id
app.put("/guesstimates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("guesstimates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Guesstimate updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating guesstimate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /guesstimates/:id
app.delete("/guesstimates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("guesstimates").delete().eq("id", id);

    if (error) throw error;

    console.log("✅ Guesstimate deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting guesstimate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== 1️⃣6️⃣ CASE COMPETITIONS ====================

// GET /case-competitions
app.get("/case-competitions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("case_competitions")
      .select("*")
      .order("competition_name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching case competitions:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /case-competitions
app.post("/case-competitions", async (req, res) => {
  try {
    const { competition_name, notes, document_url } = req.body;

    if (!competition_name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Competition name is required",
      });
    }

    const { data, error } = await supabase
      .from("case_competitions")
      .insert({ competition_name, notes, document_url })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Case competition created:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error creating case competition:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// PUT /case-competitions/:id
app.put("/case-competitions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("case_competitions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Case competition updated:", data);

    res.json({
      success: true,
      data: data,
      error: null,
    });
  } catch (err) {
    console.error("Error updating case competition:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// DELETE /case-competitions/:id
app.delete("/case-competitions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("case_competitions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("✅ Case competition deleted:", id);

    res.json({
      success: true,
      data: { id },
      error: null,
    });
  } catch (err) {
    console.error("Error deleting case competition:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== FILE UPLOAD ENDPOINTS ====================

// POST /upload/certificate
app.post("/upload/certificate", async (req, res) => {
  try {
    const { fileName, fileBase64, profile } = req.body;

    if (!fileName || !fileBase64 || !profile) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "fileName, fileBase64, and profile are required",
      });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${profile}/certificates/${timestamp}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("certificates")
      .upload(uniqueFileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("certificates").getPublicUrl(uniqueFileName);

    console.log("✅ Certificate uploaded:", publicUrl);

    res.json({
      success: true,
      data: {
        file_url: publicUrl,
        path: data.path,
      },
      error: null,
    });
  } catch (err) {
    console.error("Error uploading certificate:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// POST /upload/case-competition-doc
app.post("/upload/case-competition-doc", async (req, res) => {
  try {
    const { fileName, fileBase64 } = req.body;

    if (!fileName || !fileBase64) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "fileName and fileBase64 are required",
      });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `case-competitions/${timestamp}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(uniqueFileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(uniqueFileName);

    console.log("✅ Case competition document uploaded:", publicUrl);

    res.json({
      success: true,
      data: {
        file_url: publicUrl,
        path: data.path,
      },
      error: null,
    });
  } catch (err) {
    console.error("Error uploading case competition document:", err);
    res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

// ==================== START SERVER ====================

app.listen(port, () => {
  console.log(`🚀 Internship Preparation Tracker API running on port ${port}`);
  console.log(`📊 Supabase connected: ${supabaseUrl}`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});