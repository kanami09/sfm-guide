import ca.teamdman.langs.SFMLLexer;
import ca.teamdman.langs.SFMLParser;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.Trees;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

/**
 * Extracts ```sfml code blocks from markdown files and parses them with the released SFML grammar.
 * Usage:
 *   java Check <dir-or-file>...        check all sfml blocks
 *   java Check --tree "<program>"      print parse tree
 * Block info strings:
 *   sfml          must parse (as program, or wrapped in a trigger, or as an IF condition)
 *   sfml,error    must FAIL to parse in every wrapping
 *   sfml,ignore   skipped
 */
public class Check {
    static List<String> errors(String src) {
        List<String> errs = new ArrayList<>();
        SFMLLexer lexer = new SFMLLexer(CharStreams.fromString(src));
        lexer.removeErrorListeners();
        BaseErrorListener l = new BaseErrorListener() {
            @Override
            public void syntaxError(Recognizer<?, ?> r, Object o, int line, int col, String msg, RecognitionException e) {
                errs.add("line " + line + ":" + col + " " + msg);
            }
        };
        lexer.addErrorListener(l);
        SFMLParser parser = new SFMLParser(new CommonTokenStream(lexer));
        parser.removeErrorListeners();
        parser.addErrorListener(l);
        parser.program();
        return errs;
    }

    static List<String> tryAll(String body) {
        List<String> e1 = errors(body);
        if (e1.isEmpty()) return e1;
        if (errors("EVERY 20 TICKS DO\n" + body + "\nEND").isEmpty()) return List.of();
        if (errors("EVERY 20 TICKS DO IF " + body + " THEN END END").isEmpty()) return List.of();
        return e1;
    }

    /** Path relative to the working directory, with '/' separators, so reports read "src/x.md:7". */
    static String display(Path p) {
        Path cwd = Paths.get("").toAbsolutePath();
        Path abs = p.toAbsolutePath().normalize();
        Path shown = abs.startsWith(cwd) ? cwd.relativize(abs) : abs;
        return shown.toString().replace('\\', '/');
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 2 && args[0].equals("--tree")) {
            SFMLLexer lexer = new SFMLLexer(CharStreams.fromString(args[1]));
            SFMLParser parser = new SFMLParser(new CommonTokenStream(lexer));
            var tree = parser.program();
            System.out.println(Trees.toStringTree(tree, parser));
            return;
        }
        // Fences may be indented, e.g. when a code block belongs to a list item
        Pattern fence = Pattern.compile("(?m)^[ \\t]*```(sfml[^\\n]*)\\n(.*?)^[ \\t]*```", Pattern.DOTALL);
        int total = 0, bad = 0;
        List<Path> files = new ArrayList<>();
        for (String a : args) {
            Path p = Paths.get(a);
            if (Files.isDirectory(p)) {
                try (Stream<Path> s = Files.walk(p)) {
                    s.filter(f -> f.toString().endsWith(".md") || f.toString().endsWith(".sfml")).forEach(files::add);
                }
            } else files.add(p);
        }
        Collections.sort(files);
        for (Path f : files) {
            String text = Files.readString(f, StandardCharsets.UTF_8);
            if (f.toString().endsWith(".sfml")) {
                total++;
                List<String> e = tryAll(text);
                if (!e.isEmpty()) { bad++; System.out.println("FAIL " + display(f) + " " + e); }
                continue;
            }
            Matcher m = fence.matcher(text);
            while (m.find()) {
                String info = m.group(1).trim();
                String body = m.group(2);
                int line = text.substring(0, m.start()).split("\n", -1).length;
                if (info.contains("ignore")) continue;
                total++;
                List<String> e = info.contains("error") ? errors(body) : tryAll(body);
                if (info.contains("error")) {
                    if (e.isEmpty()) { bad++; System.out.println("EXPECTED-ERROR-BUT-PARSED " + display(f) + ":" + line); }
                } else if (!e.isEmpty()) {
                    bad++;
                    System.out.println("FAIL " + display(f) + ":" + line + " " + e);
                }
            }
        }
        System.out.println("checked " + total + " blocks, " + bad + " problems");
        if (bad > 0) System.exit(1);
    }
}
