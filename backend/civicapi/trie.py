#trie class for autocompleting candidate names
class Node:
    """A node in the Trie"""
    def __init__(self, ch=0, isWord=False):
        self.ch = ch
        self.isWord = isWord
        self.children = {}  

class Trie:
    """A class for the Trie"""
    def __init__(self):
        self.root = Node()
        self.wordcount = 0
    
    def insert(self, word):
        word = word.lower().strip()

        # Ensure the word contains at least one alphabetic character
        if not any(c.isalpha() for c in word):
            return False

        curr = self.root
        for char in word:
            # common characters in names should be allowed #FIX ME if forgot a char
            if not (char.isalpha() or char in {' ', '-', "'"}):
                continue
                
            if char not in curr.children:
                curr.children[char] = Node(ch=char)
            curr = curr.children[char]

        if curr.isWord:
            return False

        curr.isWord = True
        self.wordcount += 1
        return True

    def search(self, word):
        word = word.lower().strip()
        curr_node = self.root
        
        for char in word:
            if not (char.isalpha() or char in {' ', '-', "'"}):
                continue
            if char not in curr_node.children:
                return False
            curr_node = curr_node.children[char]
            
        return curr_node.isWord

    def remove(self, word):
        word = word.lower().strip()

        if not self.search(word):
            return False

        curr = self.root
        for char in word:
            if not (char.isalpha() or char in {' ', '-', "'"}):
                continue
            if char not in curr.children:
                return False
            curr = curr.children[char]

        if curr.isWord:
            curr.isWord = False
            self.wordcount -= 1
            return True

        return False
    
    def clear(self):
        self.root = Node()
        self.wordcount = 0
        return True
    
    def wordCount(self):
        return self.wordcount
    
    def words(self):
        """
        builds and returns a list of strings containing all of the words in
        the trie.
        """
        word_list = []
        self.rec_dfs(self.root, "", word_list)
        return word_list

    def rec_dfs(self, node, current_word, word_list):
        """
        recursive helper function to find every word
        """
        if node.isWord:
            word_list.append(current_word)

        for char in sorted(node.children.keys()):
            self.rec_dfs(node.children[char], current_word + char, word_list)

    def autocomplete(self, prefix):
        prefix = prefix.lower().strip()
        curr_node = self.root

        for char in prefix:
            if not (char.isalpha() or char in {' ', '-', "'"}):
                continue
            if char not in curr_node.children:
                return []
            curr_node = curr_node.children[char]

        results = []
        self.rec_dfs(curr_node, prefix, results)
        return results
