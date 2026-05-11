import ReactAce from "react-ace";
const AceEditor = ReactAce.default || ReactAce;

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-dawn";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", icon: "JS",  color: "#f7df1e" },
  { label: "TypeScript", value: "typescript", icon: "TS",  color: "#3178c6" },
  { label: "Python",     value: "python",     icon: "PY",  color: "#4ea8de" },
  { label: "Java",       value: "java",       icon: "JV",  color: "#f89820" },
  { label: "C / C++",   value: "c_cpp",      icon: "C+",  color: "#f34b7d" },
  { label: "Go",         value: "golang",     icon: "GO",  color: "#00ADD8" },
  { label: "Rust",       value: "rust",       icon: "RS",  color: "#dea584" },
  { label: "C#",         value: "csharp",     icon: "C#",  color: "#68b12f" },
  { label: "Ruby",       value: "ruby",       icon: "RB",  color: "#cc342d" },
  { label: "PHP",        value: "php",        icon: "HP",  color: "#8892BF" },
];

const SNIPPETS = {
  javascript: `// JavaScript — async data fetching with common pitfalls
async function fetchUserData(userId) {
  if (!userId) return null;

  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    const data = await res.json();

    const processed = data.items.map(item => ({
      id: item.id,
      name: item.name.trim(),
      score: item.score * 1.2
    }));

    localStorage.setItem('cache', JSON.stringify(processed));
    return processed;
  } catch (e) {
    console.log(e);  // silently swallowed
  }
}`,

  typescript: `// TypeScript — generic API client
interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchData<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(endpoint, options);
  const json = await res.json();
  return { data: json as T, status: res.status };
}

const result = await fetchData<{ users: User[] }>('/api/users');
console.log(result.data.users);`,

  python: `# Python — data processor with hidden bugs
import requests
from datetime import datetime

class DataProcessor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.cache = {}

    def fetch_records(self, endpoint, limit=100):
        url = f"https://api.example.com/{endpoint}"
        headers = {"Authorization": f"Bearer {self.api_key}"}

        response = requests.get(url, headers=headers)
        data = response.json()

        result = []
        for item in data['items']:
            if item['active'] == True:
                result.append({
                    'id': item['id'],
                    'value': item['value'] * 1.5,
                    'timestamp': datetime.now()
                })
        return result`,

  java: `// Java — SQL injection vulnerability example
import java.util.*;
import java.sql.*;

public class UserService {
    private Connection conn;
    private static UserService instance;

    private UserService() throws SQLException {
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost/db", "root", "password123"
        );
    }

    public static UserService getInstance() throws SQLException {
        if (instance == null) {
            instance = new UserService();
        }
        return instance;
    }

    public List<Map> getUsers(String role) throws SQLException {
        // SQL injection risk!
        String sql = "SELECT * FROM users WHERE role = '" + role + "'";
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);

        List<Map> users = new ArrayList<>();
        while (rs.next()) {
            Map<String, Object> user = new HashMap<>();
            user.put("id", rs.getInt("id"));
            users.add(user);
        }
        return users;
    }
}`,

  c_cpp: `// C++ — memory management issues
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Buffer {
public:
    int* data;
    size_t size;

    Buffer(size_t n) : size(n) {
        data = new int[n];
    }

    void fill(int val) {
        for (int i = 0; i <= size; i++) {  // off-by-one error
            data[i] = val;
        }
    }

    int get(int idx) {
        return data[idx];  // no bounds checking
    }

    ~Buffer() {
        delete data;   // should be delete[]
    }
};

int main() {
    Buffer buf(10);
    buf.fill(42);
    cout << buf.get(10) << endl;  // out of bounds
    return 0;
}`,

  golang: `// Go — concurrent scraper with race condition
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "sync"
)

var cache = map[string]string{}  // unprotected global
var mu sync.Mutex

func fetchURL(url string, wg *sync.WaitGroup) {
    defer wg.Done()
    resp, err := http.Get(url)
    if err != nil {
        fmt.Println(err)  // not logged properly
        return
    }
    defer resp.Body.Close()
    body, _ := ioutil.ReadAll(resp.Body)

    mu.Lock()
    cache[url] = string(body)
    mu.Unlock()
}

func main() {
    urls := []string{"https://example.com", "https://golang.org"}
    var wg sync.WaitGroup
    for _, url := range urls {
        wg.Add(1)
        go fetchURL(url, &wg)
    }
    wg.Wait()
}`,

  rust: `// Rust — file config parser
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::collections::HashMap;

fn parse_config(path: &str) -> HashMap<String, String> {
    let file = File::open(path).unwrap(); // panics on missing file
    let reader = BufReader::new(file);
    let mut config = HashMap::new();

    for line in reader.lines() {
        let line = line.unwrap();
        if line.starts_with('#') || line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.splitn(2, '=').collect();
        if parts.len() == 2 {
            config.insert(
                parts[0].trim().to_string(),
                parts[1].trim().to_string(),
            );
        }
    }
    config
}

fn main() {
    let cfg = parse_config("config.ini");
    println!("Host: {}", cfg["host"]); // panics if key missing
}`,

  csharp: `// C# — N+1 query problem
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

public class OrderService
{
    private readonly AppDbContext _db;

    public OrderService(AppDbContext db) => _db = db;

    // N+1 query problem: fetches orders then
    // makes a separate query per order for items
    public decimal GetTotalRevenue(int userId)
    {
        var orders = _db.Orders
            .Where(o => o.UserId == userId)
            .ToList(); // loads all orders

        decimal total = 0;
        foreach (var order in orders)
        {
            // separate DB hit per order
            var items = _db.OrderItems
                .Where(i => i.OrderId == order.Id)
                .ToList();
            foreach (var item in items)
                total += item.Price * item.Quantity;
        }
        return total;
    }
}`,

  ruby: `# Ruby — Rails controller with security issues
class UsersController < ApplicationController
  def index
    @users = User.all  # no pagination
    render json: @users
  end

  def show
    user = User.find(params[:id])
    render json: user  # exposes all attributes
  rescue
    render json: { error: "not found" }, status: 404
  end

  def create
    # Mass assignment vulnerability
    user = User.new(params[:user])

    if user.save
      session[:user_id] = user.id
      render json: user, status: 201
    else
      render json: user.errors, status: 422
    end
  end
end`,

  php: `<?php
// PHP — authentication with SQL injection
class UserAuth {
    private $pdo;

    public function __construct($host, $db, $user, $pass) {
        $this->pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    }

    public function login($username, $password) {
        // SQL injection vulnerability!
        $sql = "SELECT * FROM users WHERE username = '$username'";
        $result = $this->pdo->query($sql)->fetch();

        // Plain-text password comparison
        if ($result && $result['password'] == $password) {
            $_SESSION['user_id'] = $result['id'];
            return true;
        }
        return false;
    }

    public function getUser($id) {
        // Another injection risk
        $sql = "SELECT * FROM users WHERE id = $id";
        return $this->pdo->query($sql)->fetch();
    }
}
?>`,
};

export default function CodeEditor({
  mode, setMode,
  code, setCode,
  githubUrl, setGithubUrl,
  language, setLanguage,
  onReview, loading,
  dark = true,
}) {
  function handleLanguageChange(lang) {
    setLanguage(lang);
    if (SNIPPETS[lang]) setCode(SNIPPETS[lang]);
  }

  const activeLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="flex flex-col h-full">

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}
      >
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          {[
            { key: "code",   label: "</> Code" },
            { key: "github", label: "⌥ GitHub" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
              style={
                mode === key
                  ? { background: "var(--accent)", color: "#000", fontFamily: "var(--font-mono)" }
                  : { color: "var(--muted2)", fontFamily: "var(--font-mono)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "code" && activeLang && (
          <div
            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
            style={{
              background: `${activeLang.color}15`,
              border: `1px solid ${activeLang.color}40`,
              color: activeLang.color,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeLang.color }} />
            {activeLang.label}
          </div>
        )}
      </div>

      {/* ── Language grid ── */}
      {mode === "code" && (
        <div
          className="flex flex-wrap gap-1.5 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}
        >
          {LANGUAGES.map((lang) => {
            const active = language === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                title={lang.label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={
                  active
                    ? {
                        background: `${lang.color}18`,
                        border: `1px solid ${lang.color}55`,
                        color: lang.color,
                        boxShadow: `0 0 10px ${lang.color}25`,
                      }
                    : {
                        background: "var(--surface3)",
                        border: "1px solid var(--border)",
                        color: "var(--muted2)",
                      }
                }
              >
                <span
                  className="rounded flex items-center justify-center"
                  style={{
                    width: 18, height: 18,
                    background: active ? `${lang.color}25` : "var(--border)",
                    color: active ? lang.color : "var(--muted)",
                    fontSize: 8,
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {lang.icon}
                </span>
                {lang.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Editor ── */}
      <div className="flex-1 overflow-hidden">
        {mode === "code" ? (
          <AceEditor
            mode={language}
            theme={dark ? "one_dark" : "dawn"}
            value={code}
            onChange={setCode}
            name="code-editor"
            width="100%"
            height="100%"
            fontSize={13}
            showPrintMargin={false}
            showGutter
            highlightActiveLine
            setOptions={{
              useWorker: false,
              tabSize: 2,
              copyWithEmptySelection: true,
              enableMultiselect: false,
            }}
            onLoad={(editor) => {
              editor.container.addEventListener("keydown", (e) => {
                const ctrl = e.ctrlKey || e.metaKey;
                if (!ctrl) return;

                if (e.key === "a") {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.selectAll();
                }

                if (e.key === "c") {
                  const text = editor.getSelectedText();
                  if (text) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(text);
                  }
                }

                if (e.key === "v") {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.readText().then((text) => {
                    editor.insert(text);
                  });
                }
              }, true); // capture phase — fires before Ace sees it
            }}
            style={{ background: "var(--surface)" }}
          />
        ) : (
          <div className="h-full flex flex-col gap-4 p-5">
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest mb-2 block"
                style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
              >
                // GitHub File URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/blob/main/index.js"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
              />
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--muted2)" }}>Try an example →</p>
              {[
                "https://github.com/expressjs/express/blob/master/lib/express.js",
                "https://github.com/pallets/flask/blob/main/src/flask/app.py",
              ].map((url) => (
                <button
                  key={url}
                  onClick={() => setGithubUrl(url)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-lg mb-2 truncate transition-all"
                  style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div
        className="p-4 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface2)" }}
      >
        <button
          onClick={onReview}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider transition-all duration-300"
          style={
            loading
              ? {
                  background: "var(--surface3)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                  cursor: "not-allowed",
                }
              : {
                  background: "linear-gradient(135deg, #00d4ff, #7c6af7)",
                  color: "#000",
                  boxShadow: "0 0 30px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                }
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 rounded-full border-2 inline-block anim-spin"
                style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }}
              />
              Analyzing code...
            </span>
          ) : (
            "▶  Run AI Review"
          )}
        </button>
      </div>
    </div>
  );
}