import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Path2D;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.imageio.ImageIO;

public final class GenerateBrandingArtwork {
    private static final Color FELT = new Color(8, 28, 20);
    private static final Color GOLD = new Color(214, 182, 110);
    private static final Color CARD = new Color(246, 242, 229);

    private GenerateBrandingArtwork() {}

    public static void main(String[] args) throws Exception {
        Path root = Paths.get(".").toAbsolutePath().normalize();
        int[] sizes = {48, 72, 96, 144, 192};
        String[] folders = {"mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"};
        for (int i = 0; i < sizes.length; i++) {
            Path folder = root.resolve("android/app/src/main/res").resolve(folders[i]);
            Files.createDirectories(folder);
            writeIcon(folder.resolve("ic_launcher.png"), sizes[i], false);
            writeIcon(folder.resolve("ic_launcher_round.png"), sizes[i], true);
        }
        Path artwork = root.resolve("store-assets");
        Files.createDirectories(artwork);
        writeIcon(artwork.resolve("poker-pro-icon-512.png"), 512, false);
        writeFeatureGraphic(artwork.resolve("poker-pro-feature-graphic.png"));
    }

    private static void writeIcon(Path path, int size, boolean round) throws Exception {
        BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        quality(g);
        float s = size / 128f;
        if (round) {
            g.setClip(new Ellipse2D.Float(0, 0, size, size));
        }
        g.setPaint(new GradientPaint(0, 0, new Color(23, 61, 43), size, size, FELT));
        g.fillRect(0, 0, size, size);
        g.setColor(GOLD);
        g.setStroke(new BasicStroke(1.7f * s));
        g.draw(new Ellipse2D.Float(12 * s, 12 * s, 104 * s, 104 * s));
        g.setColor(new Color(214, 182, 110, 75));
        g.setStroke(new BasicStroke(.8f * s));
        g.draw(new Ellipse2D.Float(18 * s, 18 * s, 92 * s, 92 * s));
        drawCard(g, 67 * s, 65 * s, s, 8, true);
        drawCard(g, 59 * s, 59 * s, s, -7, false);
        g.dispose();
        ImageIO.write(image, "png", path.toFile());
    }

    private static void drawCard(Graphics2D g, float cx, float cy, float scale, double angle, boolean rear) {
        Graphics2D card = (Graphics2D) g.create();
        card.translate(cx, cy);
        card.rotate(Math.toRadians(angle));
        card.scale(scale, scale);
        RoundRectangle2D shape = new RoundRectangle2D.Float(-25, -40, 50, 80, 8, 8);
        card.setColor(rear ? new Color(180, 143, 72) : CARD);
        card.fill(shape);
        card.setColor(GOLD);
        card.setStroke(new BasicStroke(1.8f));
        card.draw(shape);
        if (!rear) {
            card.setFont(new Font("Georgia", Font.BOLD, 12));
            card.setColor(new Color(156, 120, 60));
            card.drawString("A", -18, -27);

            Path2D spade = new Path2D.Float();
            spade.moveTo(0, -12);
            spade.curveTo(-2, -7, -11, -1, -10, 5);
            spade.curveTo(-10, 12, -3, 13, 0, 8);
            spade.curveTo(3, 13, 10, 12, 10, 5);
            spade.curveTo(11, -1, 2, -7, 0, -12);
            spade.closePath();
            card.setColor(new Color(23, 51, 38));
            card.fill(spade);
            card.fill(new Path2D.Float() {{
                moveTo(-3, 7);
                lineTo(3, 7);
                lineTo(0, 14);
                closePath();
            }});

            card.setColor(new Color(180, 139, 72));
            card.setStroke(new BasicStroke(1.8f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            card.drawLine(-9, 27, -4, 15);
            card.drawLine(-4, 15, 1, 27);
            card.drawLine(-7, 23, -1, 23);
            card.drawLine(7, 16, 7, 27);
            card.drawLine(7, 21, 14, 16);
            card.drawLine(7, 21, 14, 27);
        }
        card.dispose();
    }

    private static void writeFeatureGraphic(Path path) throws Exception {
        BufferedImage image = new BufferedImage(1024, 500, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = image.createGraphics();
        quality(g);
        g.setPaint(new GradientPaint(0, 0, new Color(24, 61, 43), 1024, 500, new Color(5, 19, 15)));
        g.fillRect(0, 0, 1024, 500);
        g.setColor(new Color(214, 182, 110, 48));
        g.setStroke(new BasicStroke(2));
        g.drawOval(28, 30, 430, 430);
        g.drawOval(52, 54, 382, 382);
        BufferedImage icon = ImageIO.read(Paths.get("store-assets/poker-pro-icon-512.png").toFile());
        g.drawImage(icon, 94, 95, 300, 300, null);
        g.setColor(new Color(219, 180, 79));
        g.setFont(new Font("SansSerif", Font.BOLD, 18));
        g.drawString("POKER PRO", 520, 145);
        g.setColor(new Color(246, 242, 229));
        g.setFont(new Font("SansSerif", Font.BOLD, 49));
        g.drawString("\uD3EC\uCEE4 \uD504\uB85C", 510, 225);
        g.setColor(new Color(205, 210, 195));
        g.setFont(new Font("SansSerif", Font.PLAIN, 25));
        g.drawString("\uD640\uB364 \uD31F\uC624\uC988 \uACC4\uC0B0\uAE30", 516, 285);
        g.setColor(new Color(214, 182, 110, 180));
        g.setStroke(new BasicStroke(2));
        g.drawLine(520, 330, 930, 330);
        g.setFont(new Font("SansSerif", Font.PLAIN, 15));
        g.drawString("HOLD'EM  |  POT ODDS  |  EQUITY", 520, 362);
        g.dispose();
        ImageIO.write(image, "png", path.toFile());
    }

    private static void quality(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    }
}
