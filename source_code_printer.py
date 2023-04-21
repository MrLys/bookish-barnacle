import os
import pyperclip

# List of files to read
file_list = [
    ("index.html", "html"),
    ("main.js", "javascript"),
    ("preload.js", "javascript"),
    ("renderer.js", "javascript"),
    ("dark-theme.css", "css"),
    ("styles.css", "css"),
]

# Function to read file content with Markdown format
def read_and_format_with_markdown(file_name, language):
    try:
        with open(file_name, "r", encoding="utf-8") as file:
            content = file.read()
        return f"\n{file_name}\n```{language}\n{content}\n```\n"
    except FileNotFoundError:
        return f"File '{file_name}' not found in the current directory.\n"

# Read and format file contents
formatted_output = "Source code:\n"
for file_name, language in file_list:
    formatted_output += read_and_format_with_markdown(file_name, language)

# Copy the formatted_output to clipboard
pyperclip.copy(formatted_output)

print("Source code formatted and copied to clipboard.")
