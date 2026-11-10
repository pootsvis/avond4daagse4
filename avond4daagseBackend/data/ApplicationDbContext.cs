using Avond4DaagseBackend.data;
using Microsoft.EntityFrameworkCore;
using Route = Avond4DaagseBackend.Models.Route; // voorkomt verwarring met Microsoft.AspNetCore.Routing.Route

namespace Avond4DaagseBackend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Evenement> Evenementen => Set<Evenement>();
    public DbSet<InzetSchema> InzetSchemas => Set<InzetSchema>();
    public DbSet<PraktischeInformatie> PraktischeInformaties => Set<PraktischeInformatie>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Sponsor> Sponsors => Set<Sponsor>();
    public DbSet<EvenementSponsor> EvenementSponsors => Set<EvenementSponsor>();

    public DbSet<Persoon> Personen => Set<Persoon>();
    public DbSet<Deelnemer> Deelnemers => Set<Deelnemer>();
    public DbSet<Deelname> Deelnames => Set<Deelname>();
    public DbSet<Vrijwilliger> Vrijwilligers => Set<Vrijwilliger>();

    public DbSet<Contactpersoon> Contactpersonen => Set<Contactpersoon>();
    public DbSet<Inschrijving> Inschrijvingen => Set<Inschrijving>();
    public DbSet<Transactie> Transacties => Set<Transactie>();
    public DbSet<Betaling> Betalingen => Set<Betaling>();

    public DbSet<Gebruiker> Gebruikers => Set<Gebruiker>();
    public DbSet<Rol> Rollen => Set<Rol>();
    public DbSet<Recht> Rechten => Set<Recht>();
    public DbSet<GebruikerRol> GebruikerRollen => Set<GebruikerRol>();
    public DbSet<RolRecht> RolRechten => Set<RolRecht>();

    public DbSet<Contactvraag> Contactvragen => Set<Contactvraag>();

    public DbSet<Draaiboektaak> Draaiboektaken => Set<Draaiboektaak>();
    public DbSet<GebruikerDraaiboektaak> GebruikerDraaiboektaken => Set<GebruikerDraaiboektaak>();
    public DbSet<Taaktoewijzing> Taaktoewijzingen => Set<Taaktoewijzing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Primaire sleutels die niet via de naamconventie gevonden worden
        modelBuilder.Entity<Vrijwilliger>().HasKey(v => v.VrijwilligersId);
        modelBuilder.Entity<Draaiboektaak>().HasKey(t => t.TaakId);

        // 1-op-1: Evenement <-> InzetSchema en PraktischeInformatie (FK + UNIQUE staan bij Evenement)
        modelBuilder.Entity<Evenement>()
            .HasOne(e => e.InzetSchema)
            .WithOne(i => i.Evenement)
            .HasForeignKey<Evenement>(e => e.InzetSchemaId);

        modelBuilder.Entity<Evenement>()
            .HasOne(e => e.PraktischeInformatie)
            .WithOne(p => p.Evenement)
            .HasForeignKey<Evenement>(e => e.PraktischeInformatieId);

        // 1-op-1: Betaling <-> Transactie (FK + UNIQUE staat bij Betaling)
        modelBuilder.Entity<Betaling>()
            .HasOne(b => b.Transactie)
            .WithOne(t => t.Betaling)
            .HasForeignKey<Betaling>(b => b.TransactieId);

        // Gedeelde primaire sleutel: Deelnemer en Vrijwilliger zijn een soort Persoon
        modelBuilder.Entity<Deelnemer>(d =>
        {
            d.Property(x => x.DeelnemerId).ValueGeneratedNever();
            d.HasOne(x => x.Persoon).WithOne(p => p.Deelnemer).HasForeignKey<Deelnemer>(x => x.DeelnemerId);
        });

        modelBuilder.Entity<Vrijwilliger>(v =>
        {
            v.Property(x => x.VrijwilligersId).ValueGeneratedNever();
            v.HasOne(x => x.Persoon).WithOne(p => p.Vrijwilliger).HasForeignKey<Vrijwilliger>(x => x.VrijwilligersId);
        });

        // Koppeltabellen met samengestelde primaire sleutel
        modelBuilder.Entity<EvenementSponsor>().HasKey(x => new { x.EvenementId, x.SponsorId });
        modelBuilder.Entity<GebruikerRol>().HasKey(x => new { x.GebruikerId, x.RolId });
        modelBuilder.Entity<RolRecht>().HasKey(x => new { x.RolId, x.RechtId });
        modelBuilder.Entity<GebruikerDraaiboektaak>().HasKey(x => new { x.GebruikerId, x.TaakId });

        // Contactvraag: Gebruiker is optioneel
        modelBuilder.Entity<Contactvraag>()
            .HasOne(c => c.Gebruiker)
            .WithMany(g => g.Contactvragen)
            .HasForeignKey(c => c.GebruikerId)
            .IsRequired(false);

        // Geldbedragen
        modelBuilder.Entity<Transactie>().Property(t => t.Bedrag).HasPrecision(10, 2);
        modelBuilder.Entity<Betaling>().Property(b => b.Bedrag).HasPrecision(10, 2);
    }
}