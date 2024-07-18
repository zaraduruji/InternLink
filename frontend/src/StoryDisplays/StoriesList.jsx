import { isPast } from 'date-fns';

class StoryNode {
  constructor(data, prev = null, next = null) {
    this.data = data;
    this.prev = prev;
    this.next = next;
  }
}

class StoriesList {
  constructor() {
    this.head = new StoryNode(null);
    this.tail = new StoryNode(null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  insertStory(data) {
    if (this.size === 0) {
      this.insertAtEnd(data);
      return;
    }

    let currentNode = this.head.next;
    while (currentNode !== this.tail) {
      if (currentNode.data.userId !== data.userId) {
        if (currentNode.prev.data === null || currentNode.prev.data.userId !== data.userId) {
          this.insertAtNode(data, currentNode.prev);
          return;
        }
      } else if (data.createdAt > currentNode.data.createdAt) {
        this.insertAtNode(data, currentNode.prev);
        return;
      }
      currentNode = currentNode.next;
    }

    this.insertAtEnd(data);
  }

  insertAtNode(data, node) {
    const newNode = new StoryNode(data);
    newNode.next = node.next;
    newNode.prev = node;
    node.next.prev = newNode;
    node.next = newNode;
    this.size++;
  }

  insertAtEnd(data) {
    this.insertAtNode(data, this.tail.prev);
  }

  deleteStory(storyId) {
    let currentNode = this.head.next;
    while (currentNode !== this.tail) {
      if (currentNode.data.id === storyId) {
        this.deleteNode(currentNode);
        return true;
      }
      currentNode = currentNode.next;
    }
    return false;
  }

  deleteNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
  }

  toArray() {
    const result = [];
    let currentNode = this.head.next;
    while (currentNode !== this.tail) {
      result.push(currentNode.data);
      currentNode = currentNode.next;
    }
    return result;
  }

  // New methods

  addStory(story) {
    this.insertStory(story);
  }

  removeExpiredStories() {
    let currentNode = this.head.next;
    while (currentNode !== this.tail) {
      if (isPast(new Date(currentNode.data.expiresAt))) {
        const nextNode = currentNode.next;
        this.deleteNode(currentNode);
        currentNode = nextNode;
      } else {
        currentNode = currentNode.next;
      }
    }
  }
}

export default StoriesList;
