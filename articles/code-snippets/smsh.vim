" smsh.vim

" Define the language name and the file extensions it applies to
" Put this syntax file in the 'syntax' directory in Vim runtime
" e.g., ~/.vim/syntax/smsh.vim
" Use 'au BufRead,BufNewFile *.your_file_extension' for custom file extensions
if exists("b:current_syntax")
  finish
endif
syntax clear

" Define the color for different language elements
" String on its own line ending with colon (yellow)
syntax match customString /:$/ contains=customStringText
highlight link customString BlueSign

" Indented strings (blue)
syntax match customStringText /^\s\s*.*$/
highlight link customStringText AquaSign

" Non-indented strings without colon (yellow)
syntax match customNonIndentedString /^\S.*[^:]$/ contains=customNonIndentedStringText
highlight link customNonIndentedString AquaSign

" Import keyword (pink)
syntax match customImport /^import\s/
syntax match customImport /^using\s/
highlight link customImport AquaSign

" Decorator
syntax match decorator /^@[^" "\t]*/
highlight link decorator BlueSign

" Comment (grayed out)
syntax match customComment /^\s*#[^if].*$/
highlight link customComment Comment

syntax match ifStmt /^\s*#if.*$/
highlight link ifStmt BlueSign


