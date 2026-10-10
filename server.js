import express from "express";

const app = express();

// ========== MIDDLEWARE ==========
// Read JSON request bodies
app.use(express.json());

// ========== DATABASE ==========
// Fake database for now
const listings = [
  { id: 1, title: "Nile View Apartment", pricePerNight: 85 },
  { id: 2, title: "Beach House", pricePerNight: 140 },
  { id: 3, title: "Desert Eco-Lodge", pricePerNight: 60 },
];

// ========== MODEL ==========
// Only these functions can access the listings array

function getAllListings() {
  return listings;
}

function getListingById(id) {
  return listings.find((listing) => listing.id === id);
}

function addListing(data) {
  const newId =
    listings.length === 0
      ? 1
      : Math.max(...listings.map((listing) => listing.id)) + 1;

  const newListing = {
    id: newId,
    title: data.title,
    pricePerNight: data.pricePerNight,
  };

  listings.push(newListing);
  return newListing;
}

function updateListing(id, data) {
  const listing = getListingById(id);

  if (!listing) {
    return null;
  }

  if (data.title !== undefined) {
    listing.title = data.title;
  }

  if (data.pricePerNight !== undefined) {
    listing.pricePerNight = data.pricePerNight;
  }

  return listing;
}

function removeListing(id) {
  const index = listings.findIndex((listing) => listing.id === id);

  if (index === -1) {
    return false;
  }

  listings.splice(index, 1);
  return true;
}

// ========== CONTROLLERS ==========
// Read the request, call the model, send the response

function handleGetAll(req, res) {
  res.status(200).json(getAllListings());
}

function handleGetOne(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = getListingById(id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.status(200).json(listing);
}

function handleCreate(req, res) {
  const { title, pricePerNight } = req.body ?? {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof pricePerNight !== "number" ||
    !Number.isFinite(pricePerNight) ||
    pricePerNight <= 0
  ) {
    return res.status(400).json({
      error: "Provide a title and a positive numeric pricePerNight",
    });
  }

  const listing = addListing({
    title: title.trim(),
    pricePerNight,
  });

  res.status(201).json(listing);
}

function handleUpdate(req, res) {
  const id = Number(req.params.id);
  const data = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.keys(data).length === 0
  ) {
    return res.status(400).json({ error: "Provide listing data to update" });
  }

  if (
    (data.title !== undefined &&
      (typeof data.title !== "string" || !data.title.trim())) ||
    (data.pricePerNight !== undefined &&
      (typeof data.pricePerNight !== "number" ||
        !Number.isFinite(data.pricePerNight) ||
        data.pricePerNight <= 0)) ||
    Object.keys(data).some(
      (key) => !["title", "pricePerNight"].includes(key)
    )
  ) {
    return res.status(400).json({ error: "Invalid listing data" });
  }

  const listing = updateListing(id, {
    ...data,
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
  });

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.status(200).json(listing);
}

function handleDelete(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1 || !removeListing(id)) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.status(204).end();
}

// ========== ROUTES ==========
// Connect each HTTP method and URL to a controller
app.get("/", (req, res) => {
  res.send("Welcome to ebd bn'b");
});

app.get("/api/listings", handleGetAll);
app.get("/api/listings/:id", handleGetOne);
app.post("/api/listings", handleCreate);
app.put("/api/listings/:id", handleUpdate);
app.delete("/api/listings/:id", handleDelete);

// ========== START ==========

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});