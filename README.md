# D&D School of Geometry Spell Graph Builder

This project provides a web-based visual tool for creating and managing spell graphs, designed for the custom D&D 5e subclass of Deepak (Avalis DnD Campaign) and inspired by [School of Geometry](https://homebrewery.naturalcrit.com/share/SkwZBBxO-).

### Project Purpose

- Visual interactive spell graph based on the daily randomized spell list.
- Node-based representation and manipulation as per subclass rules.
- Specialized controls for adding, deleting, moving, highlighting, and tagging spells.
- Save/load spell arrangements and filter spells for usability.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site. The last updated version can be found here: https://francescovidaich964.github.io/spell-map/

---

## Deepak – School of Geometry Subclass Rules

Deepak has spell slots as per the wizard class table.

---

### ARCANE GRAPH

At the end of each long rest, Deepak receives a new, random spell list. At this point, Deepak must build an **Arcane Graph** representing his current spell list, following these rules:

- **Each spell in the list is a node** in the graph.
- **Spells of the same level** may be connected to form a **path** (an open, non-cyclic chain).
- **Spells of the same school** and of consecutive levels may be connected, possibly forming **cycles** (closed loops).

Whenever Deepak casts a spell, the corresponding node vanishes from the Arcane Graph.

If the result is that the graph splits into two or more disconnected subgraphs, **all nodes not in the largest subgraph vanish**. As part of the same casting action that caused the split:
- Deepak must immediately cast up to two spells randomly chosen from the vanished nodes (excluding the spell just cast).
- Targets are randomly chosen from valid options within range.

---

### WEAVE TRANSMUTATION

- Once per **short rest**, Deepak may cast a spell and substitute its **damage type** with that of another spell in the same cycle.  
- Both corresponding nodes vanish, and spell slots for **both spells** are spent.

---

### WEAVE CRYSTALLIZATION

- Once per **long rest**, Deepak may select a cycle on the Arcane Graph and perform a 10-minute ritual:
    - All nodes of the selected cycle vanish.
    - One vanished spell (of Deepak’s choice) is crystallized in an appropriate vessel, if available.

- As an action or bonus action, Deepak may break a crystal to return the spell as a node on the Arcane Graph.
    - This crystallized spell node can be connected to others, **ignoring the normal Arcane Graph rules**.

---

### WEAVE MASTERY

- Once per **long rest**, Deepak may cast a spell and change one of its parameters (level, school, casting time, range, components, duration, damage type, saving throw/ability) with that of another spell in the same cycle.
- Both nodes vanish, and spell slots for both are spent.
