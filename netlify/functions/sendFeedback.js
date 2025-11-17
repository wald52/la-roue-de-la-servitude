exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = process.env.GITHUB_TOKEN;
    console.log("Token présent ?", !!token); // Vérifie que le jeton est chargé
    const response = await fetch("https://api.github.com/repos/wald52/larouedelaservitude/discussions", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Test Netlify",
        body: "Message de test depuis Netlify.",
        category_id: 46570623
      })
    });
    const data = await response.text();
    console.log("Réponse GitHub :", data); // Affiche la réponse brute
    if (!response.ok) {
      return { statusCode: response.status, headers, body: data };
    }
    return { statusCode: 200, headers, body: "Succès !" };
  } catch (err) {
    console.error("Erreur :", err);
    return { statusCode: 500, headers, body: err.message };
  }
};
