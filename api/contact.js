export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, entreprise, email, fournisseur, message } = req.body;

  // Validation basique
  if (!nom || !entreprise || !email || !fournisseur) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  // Utilisation sécurisée de la clé via les variables d'environnement Vercel
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error('Erreur : La variable d\'environnement BREVO_API_KEY n\'est pas configurée.');
    return res.status(500).json({ error: 'Configuration serveur manquante (Clé API)' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Data Sovereign Formulaire', email: 'Martin.decombarieu@gmail.com' },
        to: [{ email: 'Martin.decombarieu@gmail.com', name: 'Martin de Combarieu' }],
        replyTo: { email: email, name: nom },
        subject: `🚀 Nouveau Contact : ${entreprise}`,
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0A192F;">Nouveau message de contact</h2>
            <p>Un visiteur a rempli le formulaire sur le site <strong>Data Sovereign</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>👤 Nom :</strong> ${nom}</p>
            <p><strong>🏢 Entreprise :</strong> ${entreprise}</p>
            <p><strong>📧 Email :</strong> ${email}</p>
            <p><strong>☁️ Fournisseur actuel :</strong> ${fournisseur}</p>
            <p><strong>💬 Message :</strong><br>${message || '<em>Aucun message fourni</em>'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #888;">Ceci est un email automatique envoyé depuis votre site web.</p>
          </div>
        `
      })
    });

    if (response.ok) {
      return res.status(200).json({ message: 'Email envoyé avec succès' });
    } else {
      const errorData = await response.json();
      console.error('Erreur Brevo:', errorData);
      return res.status(500).json({ error: 'Échec de l\'envoi de l\'email via Brevo' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
